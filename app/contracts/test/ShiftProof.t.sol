// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {ShiftProof} from "../ShiftProof.sol";
import {MockUSDC, ReentrantMockToken} from "./MockUSDC.sol";

// =============================================================================
// Helpers
// =============================================================================

contract ShiftProofTest is Test {
    ShiftProof internal sp;
    MockUSDC   internal usdc;

    address internal employer = makeAddr("employer");
    address internal worker   = makeAddr("worker");
    address internal third    = makeAddr("third");

    uint256 internal constant RATE     = 5_000_000;   // 5 USDC/h
    uint32  internal constant DUR      = 3_600;        // 1 hour
    uint256 internal constant ESCROW_1 = 5_000_000;   // 5 USDC

    function setUp() public virtual {
        usdc = new MockUSDC(6);
        sp   = new ShiftProof(address(usdc));
        // Fund employer with plenty of USDC
        usdc.mint(employer, 1_000_000e6);
        vm.prank(employer);
        usdc.approve(address(sp), type(uint256).max);
    }

    // Helpers
    function _createShift() internal returns (uint256 id) {
        vm.prank(employer);
        id = sp.createShift(worker, RATE, DUR);
    }

    function _createAndClockIn() internal returns (uint256 id) {
        id = _createShift();
        vm.prank(worker);
        sp.clockIn(id);
    }

    function _createClockInOut() internal returns (uint256 id) {
        id = _createAndClockIn();
        vm.prank(worker);
        sp.clockOut(id);
    }

    function _fullAttest(uint256 id, uint32 secs) internal {
        vm.prank(employer);
        sp.attest(id, secs);
    }
}

// =============================================================================
// Constructor
// =============================================================================

contract ConstructorTest is ShiftProofTest {
    function test_constructor_sets_usdc() public view {
        assertEq(sp.usdc(), address(usdc));
    }

    function test_constructor_nextShiftId_starts_at_1() public view {
        assertEq(sp.nextShiftId(), 1);
    }

    function test_constructor_rejects_zero_address() public {
        vm.expectRevert(ShiftProof.ZeroAddress.selector);
        new ShiftProof(address(0));
    }

    function test_constructor_rejects_18_decimal_token() public {
        MockUSDC mock18 = new MockUSDC(18);
        vm.expectRevert(ShiftProof.InvalidDecimals.selector);
        new ShiftProof(address(mock18));
    }

    function test_constructor_accepts_6_decimal_token() public {
        ShiftProof sp2 = new ShiftProof(address(usdc));
        assertEq(sp2.usdc(), address(usdc));
    }
}

// =============================================================================
// createShift — U01-U10
// =============================================================================

contract CreateShiftTest is ShiftProofTest {
    // Override setUp to ensure employer has balance and approval for MAX_HOURLY_RATE tests
    function setUp() public override {
        super.setUp();
        // Ensure employer has enough for MAX_HOURLY_RATE (1_000e6) x DUR (1h) = 1_000e6
        usdc.mint(employer, 2_000e6);
        vm.prank(employer);
        usdc.approve(address(sp), type(uint256).max);
    }

    // U01 – happy path
    function test_U01_createShift_valid() public {
        vm.prank(employer);
        vm.expectEmit(true, true, true, true);
        emit ShiftProof.ShiftCreated(1, employer, worker, ESCROW_1, RATE, DUR);
        uint256 id = sp.createShift(worker, RATE, DUR);

        assertEq(id, 1);
        assertEq(sp.nextShiftId(), 2);
        assertEq(sp.totalEscrow(), ESCROW_1);
        assertEq(usdc.balanceOf(address(sp)), ESCROW_1);

        ShiftProof.Shift memory s = sp.getShift(id);
        assertEq(s.employer, employer);
        assertEq(s.worker, worker);
        assertEq(s.escrow, ESCROW_1);
        assertEq(uint8(s.status), uint8(ShiftProof.Status.Funded));
    }

    // U02 – zero worker
    function test_U02_zero_worker_reverts() public {
        vm.prank(employer);
        vm.expectRevert(ShiftProof.ZeroAddress.selector);
        sp.createShift(address(0), RATE, DUR);
    }

    // U03 – worker == employer
    function test_U03_worker_eq_employer_reverts() public {
        vm.prank(employer);
        vm.expectRevert(ShiftProof.InvalidWorker.selector);
        sp.createShift(employer, RATE, DUR);
    }

    // U04 – zero rate
    function test_U04_zero_rate_reverts() public {
        vm.prank(employer);
        vm.expectRevert(ShiftProof.InvalidAmount.selector);
        sp.createShift(worker, 0, DUR);
    }

    // U05 – zero duration
    function test_U05_zero_duration_reverts() public {
        vm.prank(employer);
        vm.expectRevert(ShiftProof.InvalidDuration.selector);
        sp.createShift(worker, RATE, 0);
    }

    // U06 – duration > 24h
    function test_U06_duration_too_long_reverts() public {
        vm.prank(employer);
        vm.expectRevert(ShiftProof.DurationTooLong.selector);
        sp.createShift(worker, RATE, uint32(24 hours + 1));
    }

    // U07 – escrow > 10,000 USDC: rate 1000e6, maxSeconds 86400 => escrow = 24_000e6 > 10_000e6
    function test_U07_escrow_too_large_reverts() public {
        vm.prank(employer);
        vm.expectRevert(ShiftProof.EscrowTooLarge.selector);
        sp.createShift(worker, 1_000e6, uint32(24 hours));
    }

    // U08 – insufficient allowance/balance: mint worker only 0 and approve 0
    function test_U08_insufficient_allowance_reverts() public {
        address employer2 = makeAddr("employer2");
        // employer2 has no tokens and no approval
        vm.prank(employer2);
        vm.expectRevert();
        sp.createShift(worker, RATE, DUR);
    }

    // U09 – 6-decimal mock works (constructor test + create)
    function test_U09_6_decimal_works() public {
        uint256 id = _createShift();
        assertEq(sp.getShift(id).escrow, ESCROW_1);
    }

    // U10 – 18-decimal token rejected at construction (already tested in ConstructorTest)
    function test_U10_18_decimal_rejected_on_deploy() public {
        MockUSDC m18 = new MockUSDC(18);
        vm.expectRevert(ShiftProof.InvalidDecimals.selector);
        new ShiftProof(address(m18));
    }

    // Rate at exact MAX_HOURLY_RATE boundary (1000 USDC/h, 1h → escrow 1000 USDC <= 10000)
    function test_create_max_rate_boundary() public {
        // Read the constant BEFORE the prank so the external call does not consume it.
        uint256 maxRate = sp.MAX_HOURLY_RATE();
        vm.prank(employer);
        uint256 id = sp.createShift(worker, maxRate, DUR);
        assertEq(sp.getShift(id).escrow, 1_000e6);
    }

    // Rate above MAX_HOURLY_RATE reverts InvalidAmount regardless of duration
    function test_create_rate_above_max_reverts() public {
        // Read the constant and set up expectRevert BEFORE the prank so neither
        // external call consumes the prank before createShift runs.
        uint256 overRate = sp.MAX_HOURLY_RATE() + 1;
        vm.expectRevert(ShiftProof.InvalidAmount.selector);
        vm.prank(employer);
        sp.createShift(worker, overRate, DUR);
    }
}

// =============================================================================
// clockIn — U11-U13
// =============================================================================

contract ClockInTest is ShiftProofTest {
    // U11 – happy path
    function test_U11_clockIn_by_worker() public {
        uint256 id = _createShift();
        vm.prank(worker);
        vm.expectEmit(true, true, false, true);
        emit ShiftProof.ClockedIn(id, worker, uint64(block.timestamp));
        sp.clockIn(id);

        ShiftProof.Shift memory s = sp.getShift(id);
        assertEq(uint8(s.status), uint8(ShiftProof.Status.Active));
        assertEq(s.startedAt, uint64(block.timestamp));
    }

    // U12 – non-worker
    function test_U12_clockIn_non_worker_reverts() public {
        uint256 id = _createShift();
        vm.prank(third);
        vm.expectRevert(ShiftProof.NotWorker.selector);
        sp.clockIn(id);
    }

    // U13 – twice
    function test_U13_clockIn_twice_reverts() public {
        uint256 id = _createAndClockIn();
        vm.prank(worker);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.clockIn(id);
    }

    function test_clockIn_nonexistent_reverts() public {
        vm.prank(worker);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.clockIn(999);
    }
}

// =============================================================================
// clockOut — U14-U16
// =============================================================================

contract ClockOutTest is ShiftProofTest {
    // U14 – happy path
    function test_U14_clockOut_by_worker() public {
        uint256 id = _createAndClockIn();
        vm.prank(worker);
        vm.expectEmit(true, true, false, true);
        emit ShiftProof.ClockedOut(id, worker, uint64(block.timestamp));
        sp.clockOut(id);

        ShiftProof.Shift memory s = sp.getShift(id);
        assertEq(uint8(s.status), uint8(ShiftProof.Status.AwaitingAttestation));
        assertEq(s.endedAt, uint64(block.timestamp));
    }

    // U15 – clock out before clock in
    function test_U15_clockOut_before_clockIn_reverts() public {
        uint256 id = _createShift();
        vm.prank(worker);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.clockOut(id);
    }

    // U16 – same block clock-in/out is allowed; endedAt == startedAt
    function test_U16_same_block_clockInOut() public {
        uint256 id = _createShift();
        // Both in the same block (no warp)
        vm.prank(worker);
        sp.clockIn(id);
        vm.prank(worker);
        sp.clockOut(id);
        ShiftProof.Shift memory s = sp.getShift(id);
        assertEq(s.startedAt, s.endedAt);
        assertEq(uint8(s.status), uint8(ShiftProof.Status.AwaitingAttestation));
    }
}

// =============================================================================
// attest — U17-U23 + access tests
// =============================================================================

contract AttestTest is ShiftProofTest {
    // U17 – employer attests from AwaitingAttestation, owed correct, no USDC movement
    function test_U17_attest_by_employer() public {
        uint256 id = _createClockInOut();
        uint256 balBefore = usdc.balanceOf(address(sp));
        vm.prank(employer);
        vm.expectEmit(true, true, false, true);
        emit ShiftProof.Attested(id, employer, DUR, ESCROW_1);
        sp.attest(id, DUR);

        assertEq(usdc.balanceOf(address(sp)), balBefore); // no USDC movement
        ShiftProof.Shift memory s = sp.getShift(id);
        assertEq(uint8(s.status), uint8(ShiftProof.Status.Attested));
        assertEq(s.owed, ESCROW_1);
    }

    // U18 – non-employer
    function test_U18_attest_non_employer_reverts() public {
        uint256 id = _createClockInOut();
        vm.prank(worker);
        vm.expectRevert(ShiftProof.NotEmployer.selector);
        sp.attest(id, DUR);
    }

    // U19 – seconds > max
    function test_U19_attest_too_long_reverts() public {
        uint256 id = _createClockInOut();
        vm.prank(employer);
        vm.expectRevert(ShiftProof.AttestedTooLong.selector);
        sp.attest(id, DUR + 1);
    }

    // U20 – attest 0 → owed = 0
    function test_U20_attest_zero() public {
        uint256 id = _createClockInOut();
        vm.prank(employer);
        sp.attest(id, 0);
        ShiftProof.Shift memory s = sp.getShift(id);
        assertEq(s.owed, 0);
        assertEq(uint8(s.status), uint8(ShiftProof.Status.Attested));
    }

    // U21 – attest full seconds → owed == escrow
    function test_U21_attest_full() public {
        uint256 id = _createClockInOut();
        vm.prank(employer);
        sp.attest(id, DUR);
        ShiftProof.Shift memory s = sp.getShift(id);
        assertEq(s.owed, s.escrow);
    }

    // U22 – attest from Funded (timer skip) → endedAt set to now
    function test_U22_attest_from_funded() public {
        uint256 id = _createShift();
        vm.warp(block.timestamp + 100);
        vm.prank(employer);
        sp.attest(id, DUR);
        ShiftProof.Shift memory s = sp.getShift(id);
        assertEq(uint8(s.status), uint8(ShiftProof.Status.Attested));
        assertEq(s.endedAt, uint64(block.timestamp));
    }

    // U23 – attest from Active → endedAt set to now
    function test_U23_attest_from_active() public {
        uint256 id = _createAndClockIn();
        vm.warp(block.timestamp + 200);
        vm.prank(employer);
        sp.attest(id, DUR);
        ShiftProof.Shift memory s = sp.getShift(id);
        assertEq(uint8(s.status), uint8(ShiftProof.Status.Attested));
        assertEq(s.endedAt, uint64(block.timestamp));
    }

    // attest from wrong state
    function test_attest_from_attested_reverts() public {
        uint256 id = _createClockInOut();
        _fullAttest(id, DUR);
        vm.prank(employer);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.attest(id, DUR);
    }

    function test_attest_nonexistent_reverts() public {
        vm.prank(employer);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.attest(999, 0);
    }
}

// =============================================================================
// claim — U24-U27
// =============================================================================

contract ClaimTest is ShiftProofTest {
    // U24 – worker claims → USDC to worker; status Claimed or Settled
    function test_U24_claim_partial() public {
        // Rate 5, 2h → escrow 10, attest 1h → owed 5
        uint32  dur2h = 7200;
        usdc.mint(employer, 100e6);
        vm.prank(employer);
        uint256 id = sp.createShift(worker, RATE, dur2h);
        uint256 id2escrow = sp.getShift(id).escrow; // 10_000_000

        vm.prank(worker); sp.clockIn(id);
        vm.prank(worker); sp.clockOut(id);
        vm.prank(employer); sp.attest(id, 3600); // 1h

        uint256 workerBefore = usdc.balanceOf(worker);
        vm.prank(worker);
        vm.expectEmit(true, true, false, true);
        emit ShiftProof.Claimed(id, worker, RATE);
        sp.claim(id);

        assertEq(usdc.balanceOf(worker), workerBefore + RATE);
        ShiftProof.Shift memory s = sp.getShift(id);
        assertEq(uint8(s.status), uint8(ShiftProof.Status.Claimed));
        assertEq(s.owed, 0);
        assertEq(s.escrow, id2escrow - RATE);
        assertEq(sp.totalEscrow(), id2escrow - RATE);
    }

    function test_U24_claim_exact_settles() public {
        uint256 id = _createClockInOut();
        _fullAttest(id, DUR);
        vm.prank(worker);
        sp.claim(id);
        assertEq(uint8(sp.getShift(id).status), uint8(ShiftProof.Status.Settled));
        assertEq(sp.totalEscrow(), 0);
    }

    // U25 – non-worker claim
    function test_U25_claim_non_worker_reverts() public {
        uint256 id = _createClockInOut();
        _fullAttest(id, DUR);
        vm.prank(third);
        vm.expectRevert(ShiftProof.NotWorker.selector);
        sp.claim(id);
    }

    // U26 – claim twice
    function test_U26_claim_twice_reverts() public {
        uint256 id = _createClockInOut();
        _fullAttest(id, DUR);
        vm.prank(worker); sp.claim(id);
        vm.prank(worker);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.claim(id);
    }

    // U27 – zero owed
    function test_U27_claim_zero_owed_reverts() public {
        uint256 id = _createClockInOut();
        _fullAttest(id, 0);
        vm.prank(worker);
        vm.expectRevert(ShiftProof.NothingToClaim.selector);
        sp.claim(id);
    }
}

// =============================================================================
// refundUnused — U28-U31
// =============================================================================

contract RefundTest is ShiftProofTest {
    // U28 – anyone can refund; USDC goes to employer
    function test_U28_refund_by_third() public {
        // Create 2h shift, attest 1h => residual = 5 USDC
        uint32 dur2h = 7200;
        usdc.mint(employer, 100e6);
        vm.prank(employer);
        uint256 id = sp.createShift(worker, RATE, dur2h);
        uint256 escrow2h = sp.getShift(id).escrow; // 10_000_000
        vm.prank(worker); sp.clockIn(id);
        vm.prank(worker); sp.clockOut(id);
        vm.prank(employer); sp.attest(id, 3600);

        uint256 empBefore = usdc.balanceOf(employer);
        vm.prank(third);
        vm.expectEmit(true, true, false, true);
        emit ShiftProof.UnusedRefunded(id, employer, escrow2h - RATE);
        sp.refundUnused(id);

        assertEq(usdc.balanceOf(employer), empBefore + (escrow2h - RATE));
        ShiftProof.Shift memory s = sp.getShift(id);
        assertEq(s.escrow, s.owed);
        assertEq(sp.totalEscrow(), s.owed);
    }

    // U29 – refund before attest
    function test_U29_refund_before_attest_reverts() public {
        uint256 id = _createClockInOut();
        vm.prank(third);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.refundUnused(id);
    }

    // U30 – refund twice
    function test_U30_refund_twice_reverts() public {
        // 2h, attest 1h → residual
        uint32 dur2h = 7200;
        usdc.mint(employer, 100e6);
        vm.prank(employer);
        uint256 id = sp.createShift(worker, RATE, dur2h);
        vm.prank(worker); sp.clockIn(id);
        vm.prank(worker); sp.clockOut(id);
        vm.prank(employer); sp.attest(id, 3600);
        sp.refundUnused(id);
        vm.expectRevert(ShiftProof.NothingToRefund.selector);
        sp.refundUnused(id);
    }

    // U31 – refund after claim
    function test_U31_refund_after_claim_settles() public {
        uint32 dur2h = 7200;
        usdc.mint(employer, 100e6);
        vm.prank(employer);
        uint256 id = sp.createShift(worker, RATE, dur2h);
        uint256 escrow2h = sp.getShift(id).escrow;
        vm.prank(worker); sp.clockIn(id);
        vm.prank(worker); sp.clockOut(id);
        vm.prank(employer); sp.attest(id, 3600); // owed = 5 USDC
        vm.prank(worker); sp.claim(id);          // Claimed
        sp.refundUnused(id);                      // residual → Settled

        assertEq(uint8(sp.getShift(id).status), uint8(ShiftProof.Status.Settled));
        assertEq(sp.totalEscrow(), 0);
        assertEq(usdc.balanceOf(address(sp)), 0);
    }

    // T09 refund from Attested with exact pay → NothingToRefund
    function test_refund_exact_pay_reverts() public {
        uint256 id = _createClockInOut();
        _fullAttest(id, DUR); // owed == escrow
        vm.expectRevert(ShiftProof.NothingToRefund.selector);
        sp.refundUnused(id);
    }

    // T12 refund then claim
    function test_T12_refund_then_claim() public {
        uint32 dur2h = 7200;
        usdc.mint(employer, 100e6);
        vm.prank(employer);
        uint256 id = sp.createShift(worker, RATE, dur2h);
        vm.prank(worker); sp.clockIn(id);
        vm.prank(worker); sp.clockOut(id);
        vm.prank(employer); sp.attest(id, 3600);
        sp.refundUnused(id);
        uint256 workerBefore = usdc.balanceOf(worker);
        vm.prank(worker); sp.claim(id);
        assertEq(usdc.balanceOf(worker), workerBefore + RATE);
        assertEq(uint8(sp.getShift(id).status), uint8(ShiftProof.Status.Settled));
    }
}

// =============================================================================
// cancel — U32-U35
// =============================================================================

contract CancelTest is ShiftProofTest {
    // U32 – cancel by employer in Funded → full refund + Cancelled
    function test_U32_cancel_by_employer() public {
        uint256 id = _createShift();
        uint256 empBefore = usdc.balanceOf(employer);
        vm.prank(employer);
        vm.expectEmit(true, true, false, true);
        emit ShiftProof.Cancelled(id, employer, ESCROW_1);
        sp.cancel(id);

        assertEq(usdc.balanceOf(employer), empBefore + ESCROW_1);
        assertEq(uint8(sp.getShift(id).status), uint8(ShiftProof.Status.Cancelled));
        assertEq(sp.totalEscrow(), 0);
    }

    // U33 – non-employer cancel
    function test_U33_cancel_non_employer_reverts() public {
        uint256 id = _createShift();
        vm.prank(worker);
        vm.expectRevert(ShiftProof.NotEmployer.selector);
        sp.cancel(id);
    }

    // U34 – cancel after clock-in
    function test_U34_cancel_after_clockIn_reverts() public {
        uint256 id = _createAndClockIn();
        vm.prank(employer);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.cancel(id);
    }

    // U35 – cancel twice
    function test_U35_cancel_twice_reverts() public {
        uint256 id = _createShift();
        vm.prank(employer); sp.cancel(id);
        vm.prank(employer);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.cancel(id);
    }
}

// =============================================================================
// Read functions — U36-U37
// =============================================================================

contract ReadTest is ShiftProofTest {
    // U36 – nonexistent shift returns None
    function test_U36_nonexistent_shift_returns_none() public view {
        ShiftProof.Shift memory s = sp.getShift(999);
        assertEq(uint8(s.status), uint8(ShiftProof.Status.None));
        assertEq(s.employer, address(0));
        assertEq(s.escrow, 0);
    }

    // U37 – getShifts with >50 IDs reverts
    function test_U37_getShifts_too_many_ids_reverts() public {
        uint256[] memory ids = new uint256[](51);
        vm.expectRevert(ShiftProof.TooManyIds.selector);
        sp.getShifts(ids);
    }

    function test_getShifts_up_to_50_works() public {
        uint256[] memory ids = new uint256[](50);
        ShiftProof.Shift[] memory shifts = sp.getShifts(ids);
        assertEq(shifts.length, 50);
    }

    function test_getShifts_returns_none_for_unknown() public view {
        uint256[] memory ids = new uint256[](3);
        ids[0] = 100; ids[1] = 200; ids[2] = 300;
        ShiftProof.Shift[] memory result = sp.getShifts(ids);
        for (uint i = 0; i < result.length; i++) {
            assertEq(uint8(result[i].status), uint8(ShiftProof.Status.None));
        }
    }
}

// =============================================================================
// Donation test — U38
// =============================================================================

contract DonationTest is ShiftProofTest {
    // U38 – direct USDC transfer → balance increases but totalEscrow unchanged; no sweep
    function test_U38_donation_does_not_affect_totalEscrow() public {
        uint256 id = _createShift();
        uint256 escrowBefore = sp.totalEscrow();
        // Someone "donates" USDC directly to the contract
        usdc.mint(third, 100e6);
        vm.prank(third);
        usdc.transfer(address(sp), 50e6);

        // totalEscrow should not change
        assertEq(sp.totalEscrow(), escrowBefore);
        // contract balance exceeds totalEscrow
        assertGe(usdc.balanceOf(address(sp)), sp.totalEscrow());

        id; // use variable
    }
}

// =============================================================================
// T01 – None state rejects everything
// =============================================================================

contract NoneStateTest is ShiftProofTest {
    function test_T01_none_clockIn_reverts() public {
        vm.prank(worker);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.clockIn(0);
    }

    function test_T01_none_attest_reverts() public {
        vm.prank(employer);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.attest(0, 0);
    }

    function test_T01_none_claim_reverts() public {
        vm.prank(worker);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.claim(0);
    }

    function test_T01_none_refund_reverts() public {
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.refundUnused(0);
    }

    function test_T01_none_cancel_reverts() public {
        vm.prank(employer);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.cancel(0);
    }
}

// =============================================================================
// T11 – claim twice → second reverts
// =============================================================================

contract DoubleClaimTest is ShiftProofTest {
    function test_T11_claim_twice() public {
        uint256 id = _createClockInOut();
        _fullAttest(id, DUR);
        vm.prank(worker); sp.claim(id);
        vm.prank(worker);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.claim(id);
    }
}

// =============================================================================
// T15 – refund twice → second NothingToRefund
// =============================================================================

contract DoubleRefundTest is ShiftProofTest {
    function test_T15_refund_twice() public {
        uint32 dur2h = 7200;
        usdc.mint(employer, 100e6);
        vm.prank(employer);
        uint256 id = sp.createShift(worker, RATE, dur2h);
        vm.prank(worker); sp.clockIn(id);
        vm.prank(worker); sp.clockOut(id);
        vm.prank(employer); sp.attest(id, 3600);
        sp.refundUnused(id);
        vm.expectRevert(ShiftProof.NothingToRefund.selector);
        sp.refundUnused(id);
    }
}

// =============================================================================
// T16 – Settled/Cancelled → any state-change reverts
// =============================================================================

contract TerminalStateTest is ShiftProofTest {
    function test_T16_settled_rejects_all() public {
        uint256 id = _createClockInOut();
        _fullAttest(id, DUR);
        vm.prank(worker); sp.claim(id); // Settled

        vm.prank(worker);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.clockIn(id);

        vm.prank(employer);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.attest(id, 0);

        vm.prank(worker);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.claim(id);

        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.refundUnused(id);
    }

    function test_T16_cancelled_rejects_all() public {
        uint256 id = _createShift();
        vm.prank(employer); sp.cancel(id);

        vm.prank(worker);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.clockIn(id);

        vm.prank(employer);
        vm.expectRevert(ShiftProof.InvalidStatus.selector);
        sp.cancel(id);
    }
}

// =============================================================================
// Reentrancy test — U39
// =============================================================================

contract ReentrancyTest is Test {
    ReentrantMockToken internal reentToken;
    ShiftProof         internal sp;

    address internal employer = makeAddr("employer");
    address internal worker   = makeAddr("worker");

    function setUp() public {
        reentToken = new ReentrantMockToken();
        sp = new ShiftProof(address(reentToken));
        // ReentrantMockToken constructor gives all supply to msg.sender = this test contract.
        // Transfer from this contract (no prank needed) to employer.
        reentToken.transfer(employer, 1_000_000e6);
        vm.prank(employer);
        reentToken.approve(address(sp), type(uint256).max);
    }

    // U39 – reentrancy on claim via malicious token
    function test_U39_reentrancy_on_claim_blocked() public {
        // Create shift
        vm.prank(employer);
        uint256 id = sp.createShift(worker, 5_000_000, 3600);

        vm.prank(worker); sp.clockIn(id);
        vm.prank(worker); sp.clockOut(id);
        vm.prank(employer); sp.attest(id, 3600);

        // Configure reentrant callback: try to claim again during transfer
        bytes memory reentData = abi.encodeCall(sp.claim, (id));
        reentToken.setReentrantCall(address(sp), reentData);

        // claim should revert due to nonReentrant
        vm.prank(worker);
        vm.expectRevert();
        sp.claim(id);
    }

    // Reentrancy on cancel
    function test_reentrancy_on_cancel_blocked() public {
        vm.prank(employer);
        uint256 id = sp.createShift(worker, 5_000_000, 3600);

        bytes memory reentData = abi.encodeCall(sp.cancel, (id));
        reentToken.setReentrantCall(address(sp), reentData);

        vm.prank(employer);
        vm.expectRevert();
        sp.cancel(id);
    }

    // Reentrancy on refundUnused
    function test_reentrancy_on_refundUnused_blocked() public {
        vm.prank(employer);
        uint256 id = sp.createShift(worker, 5_000_000, 7200); // 2h escrow
        vm.prank(worker); sp.clockIn(id);
        vm.prank(worker); sp.clockOut(id);
        vm.prank(employer); sp.attest(id, 3600); // owed < escrow

        bytes memory reentData = abi.encodeCall(sp.refundUnused, (id));
        reentToken.setReentrantCall(address(sp), reentData);

        vm.expectRevert();
        sp.refundUnused(id);
    }
}

// =============================================================================
// Zero-attestation scenario (Scenario D)
// =============================================================================

contract ZeroAttestationTest is ShiftProofTest {
    function test_zero_attestation_refund_settles() public {
        uint256 id = _createClockInOut();
        _fullAttest(id, 0); // owed = 0

        vm.prank(worker);
        vm.expectRevert(ShiftProof.NothingToClaim.selector);
        sp.claim(id);

        uint256 empBefore = usdc.balanceOf(employer);
        sp.refundUnused(id);
        assertEq(usdc.balanceOf(employer), empBefore + ESCROW_1);
        assertEq(uint8(sp.getShift(id).status), uint8(ShiftProof.Status.Settled));
    }
}

// =============================================================================
// No native value (INV-09)
// =============================================================================

contract NoNativeValueTest is ShiftProofTest {
    // Sending ETH to the contract should fail (no receive, no fallback, not payable)
    function test_no_receive_function() public {
        vm.deal(third, 1 ether);
        vm.prank(third);
        (bool ok,) = address(sp).call{value: 1 ether}("");
        assertFalse(ok);
    }
}

// =============================================================================
// Fuzz tests
// =============================================================================

contract FuzzTest is ShiftProofTest {
    /// @dev Fuzz over rate, duration, attestedSeconds; assert owed <= escrow.
    function testFuzz_create_and_attest(
        uint256 rate,
        uint32  dur,
        uint32  attestSecs
    ) public {
        rate = bound(rate, 1, sp.MAX_HOURLY_RATE());
        dur  = uint32(bound(dur, 1, sp.MAX_SHIFT_SECONDS()));

        uint256 escrow = rate * uint256(dur) / 3600;
        vm.assume(escrow > 0);
        vm.assume(escrow <= sp.MAX_ESCROW());

        attestSecs = uint32(bound(attestSecs, 0, dur));

        usdc.mint(employer, escrow);
        vm.prank(employer);
        uint256 id = sp.createShift(worker, rate, dur);
        vm.prank(worker); sp.clockIn(id);
        vm.prank(worker); sp.clockOut(id);
        vm.prank(employer); sp.attest(id, attestSecs);

        ShiftProof.Shift memory s = sp.getShift(id);
        assertLe(s.owed, s.escrow);
    }

    /// @dev Fuzz totalEscrow consistency across multiple shifts.
    function testFuzz_totalEscrow_consistency(
        uint256 rate1,
        uint32  dur1,
        uint256 rate2,
        uint32  dur2
    ) public {
        rate1 = bound(rate1, 1, sp.MAX_HOURLY_RATE());
        dur1  = uint32(bound(dur1, 1, sp.MAX_SHIFT_SECONDS()));
        rate2 = bound(rate2, 1, sp.MAX_HOURLY_RATE());
        dur2  = uint32(bound(dur2, 1, sp.MAX_SHIFT_SECONDS()));

        uint256 e1 = rate1 * uint256(dur1) / 3600;
        uint256 e2 = rate2 * uint256(dur2) / 3600;
        vm.assume(e1 > 0 && e1 <= sp.MAX_ESCROW());
        vm.assume(e2 > 0 && e2 <= sp.MAX_ESCROW());

        address w2 = makeAddr("worker2");
        usdc.mint(employer, e1 + e2);

        vm.prank(employer);
        uint256 id1 = sp.createShift(worker, rate1, dur1);
        vm.prank(employer);
        uint256 id2 = sp.createShift(w2, rate2, dur2);

        assertEq(sp.totalEscrow(), sp.getShift(id1).escrow + sp.getShift(id2).escrow);
    }

    /// @dev Fuzz: random actor calls should only revert with documented errors or succeed.
    function testFuzz_actor_access(address actor) public {
        vm.assume(actor != address(0));
        uint256 id = _createShift();

        // clockIn from non-worker reverts NotWorker
        if (actor != worker) {
            vm.prank(actor);
            vm.expectRevert(ShiftProof.NotWorker.selector);
            sp.clockIn(id);
        }

        // cancel from non-employer reverts NotEmployer
        if (actor != employer) {
            vm.prank(actor);
            vm.expectRevert(ShiftProof.NotEmployer.selector);
            sp.cancel(id);
        }
    }
}

// =============================================================================
// Invariant handler
// =============================================================================

contract ShiftProofHandler is Test {
    ShiftProof internal sp;
    MockUSDC   internal usdc;

    address[] internal actors;
    uint256[] internal createdIds;

    constructor(ShiftProof sp_, MockUSDC usdc_) {
        sp   = sp_;
        usdc = usdc_;
        actors.push(makeAddr("h_employer"));
        actors.push(makeAddr("h_worker"));
        actors.push(makeAddr("h_third"));

        // Mint to employers
        usdc.mint(actors[0], 10_000_000e6);
        vm.prank(actors[0]);
        usdc.approve(address(sp), type(uint256).max);
    }

    function _actor(uint256 seed) internal view returns (address) {
        return actors[seed % actors.length];
    }

    function create(uint256 rateSeed, uint256 durSeed) external {
        uint256 rate = bound(rateSeed, 1, sp.MAX_HOURLY_RATE());
        uint32 dur   = uint32(bound(durSeed, 1, sp.MAX_SHIFT_SECONDS()));
        uint256 escrow = rate * uint256(dur) / 3600;
        if (escrow == 0 || escrow > sp.MAX_ESCROW()) return;

        address worker_ = actors[1];
        usdc.mint(actors[0], escrow);
        vm.prank(actors[0]);
        try sp.createShift(worker_, rate, dur) returns (uint256 id) {
            createdIds.push(id);
        } catch {}
    }

    function clockIn(uint256 idSeed) external {
        if (createdIds.length == 0) return;
        uint256 id = createdIds[idSeed % createdIds.length];
        vm.prank(actors[1]);
        try sp.clockIn(id) {} catch {}
    }

    function clockOut(uint256 idSeed) external {
        if (createdIds.length == 0) return;
        uint256 id = createdIds[idSeed % createdIds.length];
        vm.prank(actors[1]);
        try sp.clockOut(id) {} catch {}
    }

    function attest(uint256 idSeed, uint32 secsSeed) external {
        if (createdIds.length == 0) return;
        uint256 id = createdIds[idSeed % createdIds.length];
        ShiftProof.Shift memory s = sp.getShift(id);
        if (s.maxSeconds == 0) return;
        uint32 secs = uint32(secsSeed % (s.maxSeconds + 1));
        vm.prank(actors[0]);
        try sp.attest(id, secs) {} catch {}
    }

    function claim(uint256 idSeed) external {
        if (createdIds.length == 0) return;
        uint256 id = createdIds[idSeed % createdIds.length];
        vm.prank(actors[1]);
        try sp.claim(id) {} catch {}
    }

    function refundUnused(uint256 idSeed) external {
        if (createdIds.length == 0) return;
        uint256 id = createdIds[idSeed % createdIds.length];
        vm.prank(actors[2]);
        try sp.refundUnused(id) {} catch {}
    }

    function cancel(uint256 idSeed) external {
        if (createdIds.length == 0) return;
        uint256 id = createdIds[idSeed % createdIds.length];
        vm.prank(actors[0]);
        try sp.cancel(id) {} catch {}
    }

    function getCreatedIds() external view returns (uint256[] memory) {
        return createdIds;
    }
}

contract InvariantTest is Test {
    ShiftProof        internal sp;
    MockUSDC          internal usdc;
    ShiftProofHandler internal handler;

    function setUp() public {
        usdc    = new MockUSDC(6);
        sp      = new ShiftProof(address(usdc));
        handler = new ShiftProofHandler(sp, usdc);

        targetContract(address(handler));
    }

    /// INV-01: contract USDC balance >= totalEscrow
    function invariant_solvency() public view {
        assertGe(usdc.balanceOf(address(sp)), sp.totalEscrow());
    }

    /// INV-02: totalEscrow equals sum of per-shift escrow
    function invariant_totalEscrow_sum() public view {
        uint256[] memory ids = handler.getCreatedIds();
        uint256 sum;
        for (uint i = 0; i < ids.length; i++) {
            sum += sp.getShift(ids[i]).escrow;
        }
        assertEq(sp.totalEscrow(), sum);
    }

    /// INV-03: owed <= escrow for every shift
    function invariant_owed_le_escrow() public view {
        uint256[] memory ids = handler.getCreatedIds();
        for (uint i = 0; i < ids.length; i++) {
            ShiftProof.Shift memory s = sp.getShift(ids[i]);
            assertLe(s.owed, s.escrow);
        }
    }

    /// INV-04: Claimed implies owed == 0
    function invariant_claimed_owed_zero() public view {
        uint256[] memory ids = handler.getCreatedIds();
        for (uint i = 0; i < ids.length; i++) {
            ShiftProof.Shift memory s = sp.getShift(ids[i]);
            if (s.status == ShiftProof.Status.Claimed) {
                assertEq(s.owed, 0);
            }
        }
    }

    /// INV: Settled implies escrow == 0 and owed == 0
    function invariant_settled_zero() public view {
        uint256[] memory ids = handler.getCreatedIds();
        for (uint i = 0; i < ids.length; i++) {
            ShiftProof.Shift memory s = sp.getShift(ids[i]);
            if (s.status == ShiftProof.Status.Settled) {
                assertEq(s.escrow, 0);
                assertEq(s.owed, 0);
            }
        }
    }

    /// INV: Cancelled implies escrow == 0 and owed == 0
    function invariant_cancelled_zero() public view {
        uint256[] memory ids = handler.getCreatedIds();
        for (uint i = 0; i < ids.length; i++) {
            ShiftProof.Shift memory s = sp.getShift(ids[i]);
            if (s.status == ShiftProof.Status.Cancelled) {
                assertEq(s.escrow, 0);
                assertEq(s.owed, 0);
            }
        }
    }
}

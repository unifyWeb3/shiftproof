// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title ShiftProof V1
/// @notice Per-shift USDC escrow with optional clock-in/out and employer attestation.
/// @dev    No admin, owner, pause, upgrade, fee, sweep, or native-value path.
///         Amounts use 6-decimal USDC units only.
///         Floor division (truncation) favours the employer by at most 1 micro-USDC per calculation.
contract ShiftProof is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    /// @notice Maximum USDC hourly rate (1,000 USDC, 6-decimal units).
    uint256 public constant MAX_HOURLY_RATE = 1_000e6;

    /// @notice Maximum shift duration in seconds (24 hours).
    uint32 public constant MAX_SHIFT_SECONDS = 24 hours;

    /// @notice Maximum escrow per shift (10,000 USDC, 6-decimal units).
    uint256 public constant MAX_ESCROW = 10_000e6;

    // -------------------------------------------------------------------------
    // Types
    // -------------------------------------------------------------------------

    enum Status {
        None,                // 0: nonexistent
        Funded,              // 1: escrow funded, worker not clocked in
        Active,              // 2: worker clocked in
        AwaitingAttestation, // 3: worker clocked out
        Attested,            // 4: employer set payable seconds/amount
        Claimed,             // 5: worker paid; residual may remain
        Settled,             // 6: worker paid and escrow fully returned
        Cancelled            // 7: employer cancelled before clock-in
    }

    struct Shift {
        address employer;
        address worker;
        uint64  createdAt;
        uint64  startedAt;
        uint64  endedAt;
        uint32  maxSeconds;
        uint32  attestedSeconds;
        uint256 hourlyRate;   // USDC 6-decimal units per hour
        uint256 escrow;       // remaining USDC 6-decimal units in this shift
        uint256 owed;         // USDC 6-decimal units owed to the worker
        Status  status;
    }

    // -------------------------------------------------------------------------
    // Events
    // -------------------------------------------------------------------------

    event ShiftCreated(
        uint256 indexed shiftId,
        address indexed employer,
        address indexed worker,
        uint256 escrow,
        uint256 hourlyRate,
        uint32  maxSeconds
    );
    event ClockedIn(uint256 indexed shiftId, address indexed worker, uint64 at);
    event ClockedOut(uint256 indexed shiftId, address indexed worker, uint64 at);
    event Attested(
        uint256 indexed shiftId,
        address indexed employer,
        uint32  attestedSeconds,
        uint256 owed
    );
    event Claimed(uint256 indexed shiftId, address indexed worker, uint256 amount);
    event UnusedRefunded(uint256 indexed shiftId, address indexed employer, uint256 amount);
    event Cancelled(uint256 indexed shiftId, address indexed employer, uint256 amount);
    event Settled(uint256 indexed shiftId);

    // -------------------------------------------------------------------------
    // Errors
    // -------------------------------------------------------------------------

    error ZeroAddress();
    error InvalidWorker();
    error InvalidAmount();
    error InvalidDuration();
    error DurationTooLong();
    error EscrowTooLarge();
    error InvalidDecimals();
    error InvalidStatus();
    error NotEmployer();
    error NotWorker();
    error AttestedTooLong();
    error NothingToClaim();
    error NothingToRefund();
    error TooManyIds();

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    /// @notice The USDC ERC-20 token used for all escrow.
    address public immutable usdc;

    /// @notice Next shift ID to be assigned; starts at 1 (0 is invalid).
    uint256 public nextShiftId;

    /// @notice Sum of escrow across all open (non-terminal) shifts.
    uint256 public totalEscrow;

    /// @dev shiftId => Shift
    mapping(uint256 => Shift) private _shifts;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    /// @param usdc_ ERC-20 token address; must be non-zero and have 6 decimals.
    constructor(address usdc_) {
        if (usdc_ == address(0)) revert ZeroAddress();
        if (IERC20Metadata(usdc_).decimals() != 6) revert InvalidDecimals();
        usdc = usdc_;
        nextShiftId = 1;
    }

    // -------------------------------------------------------------------------
    // External state-changing functions
    // -------------------------------------------------------------------------

    /// @notice Create a new shift and pull escrow from the caller.
    /// @param  worker     Address of the worker; must be non-zero and != msg.sender.
    /// @param  hourlyRate USDC 6-decimal units per hour; must be in (0, MAX_HOURLY_RATE].
    /// @param  maxSeconds Maximum shift duration in seconds; must be in (0, MAX_SHIFT_SECONDS].
    /// @return shiftId    The newly assigned shift ID.
    function createShift(
        address worker,
        uint256 hourlyRate,
        uint32  maxSeconds
    ) external nonReentrant returns (uint256 shiftId) {
        // --- Checks ---
        if (worker == address(0)) revert ZeroAddress();
        if (worker == msg.sender) revert InvalidWorker();
        if (hourlyRate == 0 || hourlyRate > MAX_HOURLY_RATE) revert InvalidAmount();
        if (maxSeconds == 0) revert InvalidDuration();
        if (maxSeconds > MAX_SHIFT_SECONDS) revert DurationTooLong();

        uint256 escrow = hourlyRate * uint256(maxSeconds) / 3600;
        if (escrow == 0) revert InvalidAmount();
        if (escrow > MAX_ESCROW) revert EscrowTooLarge();

        // --- Interactions (inbound transfer before state write, per CEI note in spec) ---
        IERC20(usdc).safeTransferFrom(msg.sender, address(this), escrow);

        // --- Effects ---
        shiftId = nextShiftId++;
        totalEscrow += escrow;

        Shift storage s = _shifts[shiftId];
        s.employer      = msg.sender;
        s.worker        = worker;
        s.createdAt     = uint64(block.timestamp);
        s.maxSeconds    = maxSeconds;
        s.hourlyRate    = hourlyRate;
        s.escrow        = escrow;
        s.status        = Status.Funded;

        emit ShiftCreated(shiftId, msg.sender, worker, escrow, hourlyRate, maxSeconds);
    }

    /// @notice Worker clocks in; moves shift from Funded to Active.
    function clockIn(uint256 shiftId) external {
        Shift storage s = _shifts[shiftId];
        if (s.status == Status.None) revert InvalidStatus();
        if (msg.sender != s.worker) revert NotWorker();
        if (s.status != Status.Funded) revert InvalidStatus();

        s.startedAt = uint64(block.timestamp);
        s.status    = Status.Active;

        emit ClockedIn(shiftId, msg.sender, s.startedAt);
    }

    /// @notice Worker clocks out; moves shift from Active to AwaitingAttestation.
    function clockOut(uint256 shiftId) external {
        Shift storage s = _shifts[shiftId];
        if (s.status == Status.None) revert InvalidStatus();
        if (msg.sender != s.worker) revert NotWorker();
        if (s.status != Status.Active) revert InvalidStatus();

        s.endedAt = uint64(block.timestamp);
        s.status  = Status.AwaitingAttestation;

        emit ClockedOut(shiftId, msg.sender, s.endedAt);
    }

    /// @notice Employer attests worked seconds; accepts Funded, Active, or AwaitingAttestation.
    /// @param  attestedSeconds Seconds to attest; must be <= maxSeconds.
    function attest(uint256 shiftId, uint32 attestedSeconds) external {
        Shift storage s = _shifts[shiftId];
        if (s.status == Status.None) revert InvalidStatus();
        if (msg.sender != s.employer) revert NotEmployer();
        if (
            s.status != Status.Funded &&
            s.status != Status.Active &&
            s.status != Status.AwaitingAttestation
        ) revert InvalidStatus();
        if (attestedSeconds > s.maxSeconds) revert AttestedTooLong();

        uint256 owed = s.hourlyRate * uint256(attestedSeconds) / 3600;
        // Safety: owed <= escrow is guaranteed by attestedSeconds <= maxSeconds and
        // the monotonic floor of integer division, but we assert it explicitly.
        require(owed <= s.escrow, "owed > escrow");

        // If the worker never clocked out (Funded or Active path), set endedAt now.
        if (s.endedAt == 0) {
            s.endedAt = uint64(block.timestamp);
        }

        s.attestedSeconds = attestedSeconds;
        s.owed            = owed;
        s.status          = Status.Attested;

        emit Attested(shiftId, msg.sender, attestedSeconds, owed);
    }

    /// @notice Worker claims their attested pay; moves to Claimed or Settled.
    function claim(uint256 shiftId) external nonReentrant {
        Shift storage s = _shifts[shiftId];
        if (s.status == Status.None) revert InvalidStatus();
        if (msg.sender != s.worker) revert NotWorker();
        if (s.status != Status.Attested) revert InvalidStatus();
        if (s.owed == 0) revert NothingToClaim();

        // --- Effects ---
        uint256 amount = s.owed;
        s.owed    = 0;
        s.escrow -= amount;
        totalEscrow -= amount;

        if (s.escrow == 0) {
            s.status = Status.Settled;
        } else {
            s.status = Status.Claimed;
        }

        // --- Interactions ---
        IERC20(usdc).safeTransfer(s.worker, amount);

        emit Claimed(shiftId, s.worker, amount);
        if (s.status == Status.Settled) {
            emit Settled(shiftId);
        }
    }

    /// @notice Permissionless: return escrow in excess of owed back to the employer.
    ///         Accepts Attested (before claim) or Claimed (after claim); always pays employer.
    function refundUnused(uint256 shiftId) external nonReentrant {
        Shift storage s = _shifts[shiftId];
        if (s.status == Status.None) revert InvalidStatus();
        if (s.status != Status.Attested && s.status != Status.Claimed) revert InvalidStatus();
        if (s.escrow <= s.owed) revert NothingToRefund();

        // --- Effects ---
        uint256 amount = s.escrow - s.owed;
        s.escrow = s.owed;
        totalEscrow -= amount;

        // Settle when escrow drops to zero and the worker has already been paid (or owed == 0).
        bool terminal = (s.escrow == 0 && (s.status == Status.Claimed || s.owed == 0));
        if (terminal) {
            s.status = Status.Settled;
        }

        address employer = s.employer;

        // --- Interactions ---
        IERC20(usdc).safeTransfer(employer, amount);

        emit UnusedRefunded(shiftId, employer, amount);
        if (terminal) {
            emit Settled(shiftId);
        }
    }

    /// @notice Employer cancels a shift that has never been clocked in; full refund.
    function cancel(uint256 shiftId) external nonReentrant {
        Shift storage s = _shifts[shiftId];
        if (s.status == Status.None) revert InvalidStatus();
        if (msg.sender != s.employer) revert NotEmployer();
        if (s.status != Status.Funded) revert InvalidStatus();

        // --- Effects ---
        uint256 amount = s.escrow;
        s.escrow    = 0;
        totalEscrow -= amount;
        s.status    = Status.Cancelled;

        address employer = s.employer;

        // --- Interactions ---
        IERC20(usdc).safeTransfer(employer, amount);

        emit Cancelled(shiftId, employer, amount);
    }

    // -------------------------------------------------------------------------
    // View functions
    // -------------------------------------------------------------------------

    /// @notice Return a single shift. Unknown IDs return a zero-valued struct with status None.
    function getShift(uint256 shiftId) external view returns (Shift memory) {
        return _shifts[shiftId];
    }

    /// @notice Return multiple shifts. At most 50 IDs per call.
    function getShifts(uint256[] calldata shiftIds) external view returns (Shift[] memory) {
        if (shiftIds.length > 50) revert TooManyIds();
        Shift[] memory result = new Shift[](shiftIds.length);
        for (uint256 i = 0; i < shiftIds.length; i++) {
            result[i] = _shifts[shiftIds[i]];
        }
        return result;
    }
}

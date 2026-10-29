# S1 review — ShiftProof contract

**Run:** `arc-studio run --session shiftproof --file phase1/spec/ShiftProof-interface.md --prompt-file phase1/prompts/s1-contract.txt --output json`
**Result JSON:** `03-evidence/s1-run.json` — status `error`; CLI exit `1`; Studio turn ended while the test-fix rerun was still running.
**Pulled code:** `phase1/studio-s1/` (4 files changed).
**Usage after S1:** 11%.

## Contract review against 02-architecture-spec.md §5/§8/§10

| Check | Finding |
|---|---|
| Interface, events, errors, statuses | Match the spec signatures and status enum. |
| Caps and math | `1_000e6` max hourly rate, `24 hours`, `10_000e6` max escrow; 6-decimal units; floor division. |
| Access | Employer-only `attest`/`cancel`; worker-only `clockIn`/`clockOut`/`claim`; permissionless `refundUnused` pays only the employer. |
| State guards | `attest` accepts `Funded`/`Active`/`AwaitingAttestation`; `cancel` only `Funded`; terminal states reject writes. |
| Token safety | `SafeERC20`; `nonReentrant` on `createShift`, `claim`, `refundUnused`, `cancel`; state before outbound transfers; inbound pull before state write. |
| Admin/scope | No owner, admin, pause, upgrade, proxy, fee, sweep, self-destruct, factory, native path, or `receive`. |
| Deploy script | Asserts chain ID `5042`/`5042002`, canonical USDC address, and 6 decimals; compiles but was not run. |
| Tests | 2 failures in `CreateShiftTest`; both are test-harness mistakes, not contract failures: `sp.MAX_HOURLY_RATE()` and `vm.expectRevert` consume the preceding `vm.prank`, so `createShift` runs as the test contract with no allowance. |
| Local execution | Local `forge`/`arc-forge`/`bun` are not installed; local test execution is unavailable. Studio test execution is the authority for this phase. |

## Required next turn

S2: fix the two test setups only; run the full Foundry suite; do not deploy and do not touch the frontend.

## Pull addendum

The first S1 pull captured an older `MockUSDC.sol` (2,604 bytes). The Studio turn
later changed it to bubble inner reentrancy reverts (2,804 bytes) after the CLI
had returned. `phase1/studio-current/` is a fresh pull of the current Studio
workspace and supersedes the S1 snapshot for that helper. The ShiftProof contract
source hash is unchanged.

# S2 review — Foundry test repair

**Run:** `03-evidence/s2-run.json`; status `completed`; 76/76 tests pass.
**Files changed:** `contracts/test/ShiftProof.t.sol`, `AGENTS.md`.
**Contract:** unchanged.

## Evidence

- `03-evidence/s2-forge-test.log` — extracted Foundry output. It ends with
  `76 tests passed, 0 failed, 0 skipped`; invariant runs are 256 runs × 128,000
  calls with 0 reverts. The beginning of the captured log is server-truncated.
- `03-evidence/s2-test-output.txt` — Studio's final summary.
- `phase1/studio-current/` — current source pulled after S2. `MockUSDC.sol` now
  bubbles the inner reentrancy revert; this is the helper the passing run used.

## Review

The two failures were test-harness bugs, not contract defects: `vm.prank` was
consumed by an external getter in one test and by `vm.expectRevert` in the other.
The fixes preserve both test intents. No contract behavior changed.

Local Foundry execution is unavailable in this environment (`forge`, `arc-forge`,
and `bun` are not installed). Studio is the only test authority used.

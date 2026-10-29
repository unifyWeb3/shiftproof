# Frontend review — S5 + S6 correction

**Source reviewed:** `phase1/studio-current2/` (current Studio pull) and the
equivalent committed source snapshot in `../../app/` at the repo root.
**Verification:** `bun run check` → 0 lint warnings/errors, `tsc --noEmit` exit 0;
`bunx vite build` → `✓ built in 17.31s`, zero build errors (`03-evidence/s6-check-build.log`).
**Contract changes:** none. Contract source hash is unchanged from S1/S2.

## What is implemented

- Routes: `/`, `/employer`, `/worker`, `/shift/:id` (read-only public receipt),
  `/proof` (submission/judge page), `/help`; a small local router, no router dependency.
- Wallet: injected/Rabby via the scaffold's wagmi config; read-only browsing with no
  wallet; wrong-chain banner with a user-clicked switch; writes disabled on the wrong chain.
- Reads: `getShift` with the exact ABI tuple fields
  `employer, worker, createdAt, startedAt, endedAt, maxSeconds, attestedSeconds,
  hourlyRate, escrow, owed, status`; no nonexistent `escrowed`/`clockedInAt` fields.
- Employer: exact-amount USDC approval then `createShift`; `ShiftCreated` receipt event
  decoded to record the new ID; attest is bounded and allows 0 seconds in
  Funded/Active/AwaitingAttestation; cancel only in Funded; refundUnused only when
  there is residual escrow.
- Worker: role check against the assigned worker; clockIn only Funded, clockOut only
  Active, claim only Attested using the contract's `owed`.
- TxButton: confirmation card before opening the wallet; simulate, sign, wait for
  receipt; decodes custom errors via viem; no auto-retry.
- Local storage: chain+contract scoped created/assigned IDs and per-shift tx records;
  no PII. Manual ID recovery exists.
- Public receipt: read-only; full tuple, UTC and local timestamps, known local tx
  hashes, contract/USDC explorer links, share link.
- `/proof`: deployment facts, conservative verification status, explicit caveats;
  no fork hashes presented as live.
- `/help`: corrected status flow: cancel only Funded; refundUnused is permissionless
  and separate from claim; no fees, no admin/pause/upgrade, no dispute path, no PII.
- No remote fonts/scripts; Studio watermark and contract/chain footer retained.

## Residual defects and unverified items

1. **Live-USDC E2E is not run.** Only the anvil fork/MockUSDC flow passed. No live
   wallet transaction exists against `0x3984…41a6`.
2. **`/proof` public-app field is a placeholder** (“this page — hosted via Arc Studio
   preview”), not the actual Studio project URL or a public host. Repo/video/live-host
   entries are placeholders. Phase 2 must replace them.
3. **README build command mismatch.** `README.md` says `bun run build`, but the
   scaffold `package.json` has no `build` script. The verified command is
   `bunx vite build`; add a `build` script or correct the README in Phase 2.
4. **No manual wallet/browser test or screenshots.** Typecheck/build do not prove
   Rabby signing, chain switching, receipt rendering, or mobile layout.
5. **`NetworkGuard` add-chain fallback** adds the chain after a failed switch but does
   not automatically retry the switch; the user may need to click again. Low severity.
6. **Display formatting** uses `formatUnits` and then `Number` for display only. The
   contract caps amounts at 10,000 USDC, so this is safe for the demo, but it is not
   the exact-string formatter used by the on-chain helpers.
7. **Source verification remains false.** The explorer API returned bytecode but no
   source/ABI. Deployed bytecode matches the artifact except the five immutable USDC
   bytes (see `s3-review.md`); this is not a source-verification pass.

No contract defect was found in this review. These are frontend/documentation gaps
and live-runtime gaps, not a reason to claim Phase 1 live acceptance.

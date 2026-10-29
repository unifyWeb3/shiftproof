# ShiftProof V1 — Phase 1 Report (Arc Testnet)

**Date:** 2026-10-27  
**Scope:** Phase 1 only — build and test the contract and frontend inside Arc Studio, deploy to Arc Testnet, capture evidence, then stop.  
**Status:** **Build and testnet deployment complete. Live-USDC end-to-end and explorer source verification remain UNVERIFIED.** This is not a mainnet acceptance and not a claim that a real worker pilot ran.  
**Studio usage at stop:** `64%` (`03-evidence/usage-final.json`); no Studio turn was run at or after 70%.  
**Mainnet:** no deployment, no transaction, no key access, no spend.  
**GitHub:** Phase 1 pushed nothing. Phase 2b published a curated public snapshot at [github.com/unifyWeb3/shiftproof](https://github.com/unifyWeb3/shiftproof) (initial commit `3a82e89`; later doc-only updates on `main`); internal `00`–`02` documents are excluded.

---

## 1. What was built

| Area | Delivered |
|---|---|
| Contract | `ShiftProof.sol` — per-shift USDC escrow, optional clock in/out, employer attestation, worker claim, permissionless residual refund, employer cancel before clock-in. No admin/owner/pause/upgrade/fee/sweep/native-value path. |
| Tests | `ShiftProof.t.sol` — unit matrix, transition matrix, fuzz tests, and six invariants; test-only `MockUSDC.sol` and reentrancy helper. |
| Deploy | `Deploy.s.sol` — chain ID, canonical USDC, and 6-decimal pre-flight checks. Gas funding is a manual precondition; the script does not check the deployer balance. |
| Testnet deployment | `0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6` on Arc Testnet (`5042002`). |
| Frontend | Vite + React 18 + TypeScript + Tailwind + wagmi/viem/ConnectKit scaffold; routes `/`, `/employer`, `/worker`, `/shift/:id`, `/proof`, `/help`; injected wallet; read-only browsing; wrong-chain guard; confirmation card; exact-amount approval; local shift history; public receipt; help/disclosures. |
| Evidence | Studio run JSON for S1–S6, forge output, on-chain reads, explorer responses, fork E2E JSON, frontend check/build log, usage logs, review notes. |

The final source snapshot is committed in `app/` (see §11). Intermediate Studio pulls remain under `arc-pipeline/phase1/studio-*` locally for audit, but are not part of the app commit.

---

## 2. Test results

### 2.1 Contract tests — PASS

`arc-studio` S2 turn; raw result `03-evidence/s2-run.json`, extracted test log `03-evidence/s2-forge-test.log`.

```text
Ran 19 test suites in 282.08s: 76 tests passed, 0 failed, 0 skipped (76 total tests)
```

The six invariants ran at **256 runs × 128,000 calls** and reported **0 reverts**:
solvency, `totalEscrow` sum, `owed <= escrow`, claimed implies `owed == 0`,
settled implies zero escrow/owed, and cancelled implies zero escrow/owed. The S2
log records six passing `invariant_*` functions. The S1 test run ended with two
test-harness failures; S2 fixed only the `vm.prank`/`vm.expectRevert` setup. The
contract source was not changed.

Local Foundry/`bun` are not installed in this CLI environment. Studio was the test
authority; no local forge result is claimed.

### 2.2 Testnet deployment — PASS (deployment/read-back)

Independent public-RPC check: `03-evidence/s3-onchain-verification.json`.
Deployment record: `03-evidence/deployments-current.json`.

| Field | Result |
|---|---|
| Chain ID | `0x4cef52` = `5042002` (Arc Testnet) |
| Contract | `0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6` |
| Deployment tx | `0x89b616d394bd6b834901e24d3651fd05bdcbe4d84dae64befeb5fc5f40dcfd52` |
| Receipt | status `0x1`, block `69263663` |
| Deployer | `0xe6d84f24fc96ac684c99eb85005305a509b01be3` (testnet platform wallet; not user-owned) |
| Tx target | EntryPoint `0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789` (account-abstraction deployment) |
| Code | 5,990 bytes, non-empty |
| `usdc()` | `0x3600000000000000000000000000000000000000` |
| `nextShiftId()` | `1` |
| `totalEscrow()` | `0` |
| Caps | `MAX_HOURLY_RATE=1000000000`, `MAX_SHIFT_SECONDS=86400`, `MAX_ESCROW=10000000000` |

The deployed bytecode matches the compiled artifact except for the five bytes that
embed the immutable USDC address (`0x36` at offsets 395, 1474, 1932, 2394, 4141;
the rest of the 20-byte address is zero). This is a bytecode/artifact check, **not**
source verification.

### 2.3 Fork E2E — PASS for contract logic only

`03-evidence/testnet-e2e-fork.json`, `03-evidence/TESTNET-E2E-fork.md`, and the
reading note `03-evidence/TESTNET-E2E-NOTE.md`.

An anvil fork of Arc Testnet was used with a fresh MockUSDC + fresh ShiftProof
(`testedViaFork: true`). Three flows passed 3/3: happy path (10 USDC escrow, attest
1.5h, claim 7.5, refund 2.5), cancel before clock-in (full refund), and zero
attestation (full refund). The fork could not exercise canonical Arc USDC because
its blocklist precompile is absent in vanilla anvil.

**These are not live testnet transaction hashes.** The fork contract was
`0x535b3d7a252fa034ed71f0c53ec0c6f784cb64e1` with MockUSDC
`0x522b3294e6d06aa25ad0f1b8891242e335d3b459`, and the actors were impersonated.
The live contract's `nextShiftId` remains `1`; no live write occurred.

### 2.4 Frontend verification — PASS (static/build)

`03-evidence/s6-run.json`; exact summary `03-evidence/s6-check-build.log`.

- `bun run check`: **0 lint warnings / 0 errors**; `tsc --noEmit` exit 0.
- `bunx vite build`: **succeeded in 17.31s**; large-chunk notices are warnings, not errors.
- ABI tuple fields were corrected to the deployed ABI
  (`employer, worker, createdAt, startedAt, endedAt, maxSeconds, attestedSeconds,
  hourlyRate, escrow, owed, status`); the public receipt is read-only; employer
  actions include attest/cancel/refund; worker actions are role-gated; the
  `/proof` page is the submission page, not a lookup.

Frontend review detail and residual defects: `03-evidence/frontend-review.md`.

---

## 3. What is verified vs. unverified

### Verified

- Contract source compiled and the Studio suite passed 76/76, including invariants.
- Deployed testnet code exists at the recorded address and the public reads match.
- Deployment receipt succeeded at the recorded block/chain.
- Frontend lint, typecheck, and production build pass.
- Fork-lane contract flows pass for happy path, cancel, and zero attestation.
- The contract has no admin/owner/pause/upgrade/fee/sweep/native path; the UI does
  not ask for seed phrases/private keys and has no backend or PII fields.

### Unverified / not done

| Item | Why it matters | Evidence / state |
|---|---|---|
| **Live-USDC E2E** on Arc Testnet with two real wallets | Fork/MockUSDC cannot prove the canonical USDC + blocklist precompile path | No live write; live `nextShiftId` still `1`; S4 explicitly `testedViaFork: true` |
| **Source verification on explorer** | Judges should see verified source or a documented verifier result | `verified: false`; explorer API returned bytecode only, no source/ABI/is_verified (`explorer-verification-attempt.json`, `explorer-contract.json`) |
| **Manual Rabby/browser test** | Build/typecheck do not prove signing, chain switching, receipt rendering, or mobile layout | No browser screenshot/test captured; checklist in `screenshot-notes.md` |
| **Screenshots/video/host/repo** | Submission assets; Phase 1 did not publish | `/proof` still has placeholder public-app/repo/video fields; the app README now says `bunx vite build` because `package.json` has no production `build` script |
| **Gas/blocklist failures** | The real Arc USDC behavior was not exercised live | Fork limitation above; no faucet-funded EOA run |
| **Mainnet** | Not authorized in Phase 1 | No mainnet deployment, transaction, or key material |

No contract defect was found in the testnet deployment/read-back or the fork execution.
The unresolved items are live-runtime, source-verification, and submission-asset gaps.

---

## 4. Security and threat-model notes

- **No privileged path:** no owner, admin, pause, proxy, upgrade, fee, sweep, rescue,
  or native-value function. The deployer has no post-deploy privilege.
- **USDC handling:** exact-amount approval in the UI; `SafeERC20`; state-before-transfer
  for claim/refund/cancel; one inbound `safeTransferFrom` exception documented in the
  source; `ReentrancyGuard` on state-changing paths; no arbitrary token or recipient.
- **Trust model:** work truth is employer attestation, not trustless verification;
  the UI and Help say this explicitly. There is no dispute mechanism; unused escrow is
  refunded only by a separate permissionless `refundUnused` call.
- **Privacy:** the app stores only public addresses, shift IDs, amounts, and tx hashes;
  localStorage is a convenience cache; no names/emails/locations/tax data.
- **Key authority:** no mainnet key was requested, read, or stored. The testnet
  deployment used Studio's platform wallet. Fork actors were impersonated addresses.
- **Disclosed demonstration:** separate employer/worker roles are required; no real
  worker pilot without a jurisdiction check.

---

## 5. What Phase 2 needs from the human

1. **C4 checkpoint / mainnet authority:** the 2026-10-29 05:15 UTC amendment closes
   C4, confirms Arc mainnet USDC, authorizes a 40 USDC total cap including optional
   S0 (36.25 planned), and makes Remix + Rabby (Path B) primary. Every mainnet
   transaction still needs separate approval, and mainnet deployment is not
   authorized. The public wallet addresses remain `<ADDR>` in the decision file.
2. **Live testnet E2E:** fund two disposable Arc Testnet wallets from the faucet, run
   the four-flow checklist with real USDC and two Rabby accounts, capture live tx
   hashes and screenshots, and test wrong network, wrong role, insufficient gas, and
   blocklist failure.
3. **Source verification:** establish an actual Arc explorer verification path (or
   document the manual bytecode/source-hash proof if verification is unavailable).
   Do not call the contract source-verified until the verifier returns success.
4. **Submission assets:** choose/publicize the host and repo; add the public app URL,
   Studio project URL, repo, and video to `/proof`; add a production `build` script or
   correct the README; capture the screenshot set in `03-evidence/screenshot-notes.md`.
5. **Frontend hardening before mainnet:** run the manual wallet/browser checklist;
   confirm the wrong-chain add/switch flow, role gating, tx receipts, and responsive
   layout; review the residual items in `frontend-review.md`.
6. **Legal:** obtain the jurisdiction/1099/contract check before any real worker pilot;
   keep the disclosed-demo framing and separate wallets.
7. **Mainnet execution:** external, human-run deploy/verification only; no agent key
   handling; record commit, compiler settings, constructor argument, runtime bytecode
   hash, and per-transaction approvals.

---

## 6. Evidence index

| Path | Contents |
|---|---|
| `03-evidence/s1-run.json`, `s1-review.md` | Contract authoring turn and review |
| `03-evidence/s2-run.json`, `s2-forge-test.log`, `s2-review.md` | 76/76 tests and invariant output |
| `03-evidence/s3-run.json`, `s3-review.md` | Deployment turn and review |
| `03-evidence/s3-onchain-verification.json` | Independent RPC receipt, code, reads |
| `03-evidence/explorer-verification-attempt.json`, `explorer-contract.json` | Explorer verifier attempts and raw response |
| `03-evidence/s4-run.json`, `s4-pull.log`, `TESTNET-E2E-fork.md`, `testnet-e2e-fork.json` | Fork E2E turn and evidence |
| `03-evidence/TESTNET-E2E-NOTE.md` | Why the E2E is fork-only; live hashes are not used |
| `03-evidence/s5-run.json`, `s5-pull.log` | First frontend build |
| `03-evidence/s6-run.json`, `s6-check-build.log`, `frontend-review.md` | Corrected frontend, check/build, review |
| `03-evidence/usage-*.json`, `usage-final.json` | Studio usage; stopped at 64% |
| `03-evidence/screenshot-notes.md` | Required screenshots and states; none captured |
| `03-evidence/deployments-current.json` | Deployment record with block and `verified:false` |
| `phase1/prompts/` | Exact prompts sent to Studio |
| `phase1/spec/ShiftProof-frontend.md` | Frontend spec excerpt attached to Studio |

---

## 7. Local commits

- App source snapshot: `9aa2c5e82b6403a40a8dea7797e32d2e87b513ef`
  (`Phase 1: ShiftProof Arc Testnet app source and deployment`).
- Report/evidence commit: `246a11038f9ac28f97e5677f74b17d98cb6d68af`
  (`Phase 1: report, testnet evidence, and verification notes`).
- Exact hashes are also recorded in `arc-pipeline/03-evidence/commits.txt`.
- Phase 1 added no remote and pushed nothing.
- Phase 2b published a curated public snapshot at
  [github.com/unifyWeb3/shiftproof](https://github.com/unifyWeb3/shiftproof); the
  initial commit is `3a82e89`, with later doc-only updates on `main`. The internal
  `00`–`02` documents are not included.

---

## 8. Stop state

Phase 1 ends here. The contract is deployed and tested on Arc Testnet; the frontend
is built and static-verified against the deployed address. The next gate is a
human-owned live-USDC testnet run and source-verification decision, followed by the
separate Phase 2 mainnet authorization. No mainnet deployment, transaction, key
handling, or spend occurred. Phase 1 did not host or push; Phase 2b later published
the curated repo and a testnet-only Vercel preview.

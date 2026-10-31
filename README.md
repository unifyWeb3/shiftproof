# ShiftProof

> **Disclosed demonstration — not a live payroll service.**  
> ShiftProof is a per-shift USDC escrow demo built with [Arc Studio](https://studio.arc.io). Both the employer and worker wallets are controlled by the builder. No real worker pilot, letter of intent, legal review, or production payroll use is claimed. The contract pays on **employer attestation**, not trustless verification of work. There are no worker fees. Do not use this with real workers until a jurisdiction/legal review and a written pilot agreement exist.

**Status:** Phase 2b. The contract is frozen and tested on Arc Testnet, and a mainnet deployment is live at `0x2A88dDe461280F5a3Ad959fd6997388409e766a9`. The mainnet deployment was compiled in Remix with optimizer disabled, so its runtime bytecode differs from the optimized 5,990-byte Studio artifact; Sourcify reports an exact source match for creation and runtime. The public repo and Vercel production deployment are live. Mainnet USDC has real value, the contract is not audited, and the demo is not a production payroll service.

**Labels:** `VERIFIED` = directly observed in the linked evidence; `UNVERIFIED` = prepared or inferred but not exercised on mainnet; `UNRESOLVED` = a human decision, external dependency, or open contradiction.

The full claim-to-evidence register is in the [mainnet package](arc-pipeline/04-mainnet-package.md). Unresolved reproducibility gaps are listed there too.

## Proof at a glance

| Asset | Value | Status |
|---|---|---|
| Production app (mainnet) | [shiftproof-phi.vercel.app](https://shiftproof-phi.vercel.app) | `VERIFIED` Vercel production deployment |
| Public repo | [github.com/unifyWeb3/shiftproof](https://github.com/unifyWeb3/shiftproof) | `VERIFIED` |
| Demo video | Not recorded | `UNRESOLVED` |
| Arc Studio project | [studio.arc.io/app/35650d11-57a8-4743-8c23-a6bfe1a02f39](https://studio.arc.io/app/35650d11-57a8-4743-8c23-a6bfe1a02f39) | `VERIFIED` URL; public access `UNRESOLVED` |
| Builder profile | [x.com/oxunify](https://x.com/oxunify) | `VERIFIED` URL provided; ownership `UNVERIFIED` |
| Arc mainnet contract | [`0x2A88dDe461280F5a3Ad959fd6997388409e766a9`](https://explorer.arc.io/address/0x2A88dDe461280F5a3Ad959fd6997388409e766a9) | `VERIFIED` |
| Arc mainnet deploy tx | [`0x9b56fa4…36d98`](https://explorer.arc.io/tx/0x9b56fa49c2c78b78ac24c7f4f154d4825194c6939b05f4e8086a8d5e10336d98) | `VERIFIED` |
| Source verification | Sourcify exact match (creation + runtime) | `VERIFIED` on Sourcify; explorer pending |
| Mainnet demo txs | Not run | `UNVERIFIED` |
| Arc testnet contract | [`0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6`](https://explorer.testnet.arc.io/address/0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6) | `VERIFIED` |
| Arc testnet deploy tx | [`0x89b616d…dcfd52`](https://explorer.testnet.arc.io/tx/0x89b616d394bd6b834901e24d3651fd05bdcbe4d84dae64befeb5fc5f40dcfd52) | `VERIFIED` |
| Contract tests | 76/76 Studio run; six invariants at 256 runs × 128,000 calls | `VERIFIED` |
| Live-USDC E2E on testnet | Not run with two live wallets | `UNVERIFIED` |
| Mainnet demo shifts | A/B/C not run | `UNVERIFIED` |

## What it is

ShiftProof is a narrow primitive for hourly/1099-style work:

1. An employer pre-funds a shift in USDC.
2. The worker optionally clocks in and out.
3. The employer attests the number of seconds to pay.
4. The worker claims the earned USDC.
5. Any unused escrow can be refunded to the employer with a separate `refundUnused` call.
6. The employer can cancel before the worker clocks in.

The contract is one immutable, keyless deployment. It has no owner, admin, pause, proxy, upgrade, fee, sweep, or native-value path. `VERIFIED` in the [contract source](app/contracts/ShiftProof.sol) and [Phase 1 report](arc-pipeline/03-phase1-report.md).

| Fact | Value | Status |
|---|---|---|
| Source | `app/contracts/ShiftProof.sol:ShiftProof` | `VERIFIED` |
| Source Keccak-256 | `0x5d5e2edb0e2cea4601933f12b2a59bd4e0424d07375323404e0df5c2813ae3ca` | `VERIFIED` |
| Frozen Studio compiler | `solc 0.8.28+commit.7893614a` | `VERIFIED` |
| Frozen Studio EVM target | `cancun` | `VERIFIED` |
| Frozen Studio optimizer | enabled, 200 runs | `VERIFIED` |
| Remix mainnet compiler | `solc 0.8.28+commit.7893614a` | `VERIFIED` — Sourcify metadata |
| Remix mainnet EVM target | `cancun` | `VERIFIED` — Sourcify metadata |
| Remix mainnet optimizer | **disabled** | `VERIFIED` — Sourcify metadata |
| `viaIR` | false / unset | `VERIFIED` |
| Metadata bytecode hash | `ipfs` | `VERIFIED` |
| OpenZeppelin | `5.6.1` | `VERIFIED` |
| USDC (ERC-20 interface) | `0x3600000000000000000000000000000000000000`, 6 decimals | `VERIFIED` |
| Native gas | USDC, 18 decimals; same underlying balance | `VERIFIED` |
| Frozen optimized runtime | 5,990 bytes, `0x843ef44664f6eb7bbbe95c213d6fd60b88d912b3810d087981ab69a94b90b1e5` | `VERIFIED` reconstruction |
| Deployed mainnet runtime | 10,864 bytes, `0x83cd0dd06d49f7493eda6dea3f2a2042f04d5ba724bcb22a7f41200dce41bb4a` | `VERIFIED` on mainnet; optimizer disabled; Sourcify exact source match |
| Testnet runtime | 5,990 bytes, same hash as frozen optimized artifact | `VERIFIED` |

## What it is not

- **Not live payroll or earned-wage access.** It is a disclosed demonstration. No real employer/worker pilot is claimed.
- **Not trustless work verification.** The employer's attestation is the trust anchor. The contract cannot prove the worker actually worked.
- **Not audited.** No security audit has been performed. Do not claim one.
- **Not a dispute system.** There is no arbitration, escrow agent, or onchain dispute path. Disagreements must be resolved off-chain before attestation.
- **Not a fee product.** There is no protocol fee, admin cut, or token. Workers pay no fee; gas is paid by the transacting wallet.
- **Not a production payroll service.** The mainnet deployment is a disclosed demonstration. Real USDC is at risk; do not use it with real workers without legal review and a written pilot agreement.
- **Not source-verified on the block explorer.** Sourcify reports an exact source match for creation and runtime; explorer verification may still be pending. Do not call it explorer-verified until the explorer shows the source/ABI.

## How it works

| Status | Who can act / what |
|---|---|
| `Funded` | Worker: `clockIn`; Employer: `cancel`, `attest` |
| `Active` | Worker: `clockOut`; Employer: `attest` |
| `AwaitingAttestation` | Employer: `attest` |
| `Attested` | Worker: `claim`; anyone: `refundUnused` (always pays employer) |
| `Claimed` | Anyone: `refundUnused` if `escrow > owed` |
| `Settled` | Terminal |
| `Cancelled` | Terminal |

`cancel` is only allowed while `Funded` (before clock-in). `refundUnused` is permissionless but always pays the employer. `claim` does **not** automatically refund unused escrow; that is a separate call.

Escrow is computed as `hourlyRate × maxSeconds / 3600`, in 6-decimal USDC. Caps: `MAX_HOURLY_RATE=1,000 USDC`, `MAX_SHIFT_SECONDS=24h`, `MAX_ESCROW=10,000 USDC`. `VERIFIED` in the contract and [Help page](app/src/pages/Help.tsx).

## Evidence

| ID | Evidence |
|---|---|
| E02 | [Phase 1 report](arc-pipeline/03-phase1-report.md) |
| E03 | [Contract test log](arc-pipeline/03-evidence/s2-forge-test.log) |
| E04 | [Testnet on-chain verification](arc-pipeline/03-evidence/s3-onchain-verification.json) |
| E05 | [Testnet deployment record](arc-pipeline/03-evidence/deployments-current.json) |
| E06 | [Frozen artifact metadata](app/contracts/out/ShiftProof.sol/ShiftProof.json) |
| E07 | [Foundry config](app/foundry.toml) |
| E08 | [Package/dependency pins](app/package.json) |
| E09 | [Arc docs: contract addresses](https://docs.arc.io/arc/references/contract-addresses.md) |
| E10 | [Arc docs: connect to Arc](https://docs.arc.io/arc/references/connect-to-arc.md) |
| E11 | [Arc docs: gas and fees](https://docs.arc.io/arc/references/gas-and-fees.md) |
| E12 | [Arc docs: EVM differences](https://docs.arc.io/arc/references/evm-differences.md) |
| E13 | [Arc docs: deploy on Arc](https://docs.arc.io/arc/tutorials/deploy-on-arc.md) |
| E14 | [Arc docs: install Arc Foundry](https://docs.arc.io/arc/tutorials/install-arc-foundry.md) |
| E15 | [Explorer verification attempt](arc-pipeline/03-evidence/explorer-verification-attempt.json) |
| E16 | [Frontend check/build log](arc-pipeline/03-evidence/s6-check-build.log) |
| E17 | [Fork E2E evidence](arc-pipeline/03-evidence/TESTNET-E2E-fork.md) |
| E18 | [Contract source](app/contracts/ShiftProof.sol) |
| E19 | [Arc Studio project](https://studio.arc.io/app/35650d11-57a8-4743-8c23-a6bfe1a02f39) |
| E20 | [Builder profile](https://x.com/oxunify) |
| E23 | [Bytecode analysis](arc-pipeline/04-evidence/bytecode-analysis.json) |
| E24 | [Mainnet package](arc-pipeline/04-mainnet-package.md) |

## Test and deployment evidence

- **Studio test run:** 76/76 tests passed, 0 failed, 0 skipped; six invariants at 256 runs × 128,000 calls, 0 reverts. `VERIFIED` [E03].
- **Testnet deployment:** Arc Testnet `5042002`, contract `0x39845ad…41a6`, tx `0x89b616d…fd52`, block `69263663`, receipt status `1`. `VERIFIED` [E04, E05].
- **Testnet reads:** 5,990 bytes; `usdc()=0x3600…0000`; `nextShiftId=1`; `totalEscrow=0`; caps as expected. `VERIFIED` [E04].
- **Bytecode match:** testnet runtime equals the frozen artifact after patching the five immutable USDC bytes at offsets 395, 1,474, 1,932, 2,394, 4,141; only those five bytes differ from the zeroed artifact. `VERIFIED` [E04, E23].
- **Fork E2E:** 3/3 flows passed with anvil + MockUSDC (happy path, cancel, zero attestation). These are **not** live testnet tx hashes. `VERIFIED` for fork logic; `UNVERIFIED` for live USDC [E17].
- **Frontend:** `bun run check` passed (0 lint warnings/errors; `tsc --noEmit` exit 0); `bunx vite build` succeeded. `VERIFIED` [E16].
- **Live-USDC testnet E2E with two real wallets:** not run. `UNVERIFIED` [E02 §3].
- **Source verification:** explorer API returned bytecode only, no source/ABI; `verified:false`. `VERIFIED` for the failed attempt; do not call it verified [E15].
- **Mainnet:** contract `0x2A88dDe461280F5a3Ad959fd6997388409e766a9`, deploy tx `0x9b56fa4…36d98`, block `28736878`; runtime `10,864` bytes, `0x83cd0…bb4a`; Sourcify creation/runtime `exact_match`; at deployment time `usdc()`, `nextShiftId=1`, `totalEscrow=0` passed; `nextShiftId()` is now `2` with shift #1 settled. `VERIFIED` [mainnet-deploy.md](arc-pipeline/03-evidence/mainnet-deploy.md).

## Deployment provenance

**Studio-generated artifacts.** `app/contracts/out/ShiftProof.sol/ShiftProof.json`, `app/foundry.toml`, the source under `app/contracts/`, the test suite, and the Arc Testnet deployment came from the Studio/Foundry build. That artifact uses solc `0.8.28+commit.7893614a`, Cancun, optimizer **enabled with 200 runs**, `viaIR` false, and metadata bytecode hash `ipfs`. Its runtime is 5,990 bytes, keccak `0x843ef44664f6eb7bbbe95c213d6fd60b88d912b3810d087981ab69a94b90b1e5`.

**Manual mainnet changes.** The mainnet entry in `app/src/lib/networks.ts` is a manual, data-only edit recording contract `0x2A88dDe461280F5a3Ad959fd6997388409e766a9`, block `28736878`, tx `0x9b56fa49c2c78b78ac24c7f4f154d4825194c6939b05f4e8086a8d5e10336d98`, and `isConfigured: true`. The Remix deployment is a manual deployment of the unchanged `app/contracts/ShiftProof.sol` source. No contract source was changed for mainnet.

**Remix deployment settings.** solc `0.8.28+commit.7893614a`, EVM `cancun`, optimizer **disabled** (metadata records `runs: 200` but `enabled: false`), metadata bytecode hash `ipfs`, constructor USDC `0x3600000000000000000000000000000000000000`. Sourcify reports `creationMatch: exact_match` and `runtimeMatch: exact_match` for [`0x2A88…66a9`](https://repo.sourcify.dev/5042/0x2A88dDe461280F5a3Ad959fd6997388409e766a9). The deployed runtime is 10,864 bytes, keccak `0x83cd0dd06d49f7493eda6dea3f2a2042f04d5ba724bcb22a7f41200dce41bb4a`.

**Production deployment.** The mainnet frontend is live at [`https://shiftproof-phi.vercel.app`](https://shiftproof-phi.vercel.app), Vercel deployment `dpl_Bj9PawyUuUnAsytvkAjEoS379Js1`, target `production`, with no deployment protection. It was built with `VITE_NETWORK=mainnet`. All six routes (`/`, `/employer`, `/worker`, `/proof`, `/shift/1`, `/help`) returned HTTP 200 in fresh logged-out browser contexts, with no Vercel authentication, no console errors, no testnet links or text, chain `5042`, and contract `0x2A88…66a9`. `/shift/1` renders a real settled mainnet shift: `0.15 USDC/hr`, `1h`, created `2026-10-31 02:29:03 UTC`.

**What the verifier says.** The read-only verifier's public reads pass, but its frozen-artifact comparison fails: 10,864 != 5,990 bytes, runtime hash `0x83cd…bb4a` != `0x843e…b1e5`, and 5,748 byte positions differ. The deployed contract does **not** match the frozen optimized bytecode. Do not claim that it does. The difference is explained by the optimizer setting, not by a different source.

**Source hash comparison.** The frozen package records source Keccak-256 `0x5d5e2edb0e2cea4601933f12b2a59bd4e0424d07375323404e0df5c2813ae3ca` for the 13,039-byte `app/contracts/ShiftProof.sol`; the local file hashes to that value. The Sourcify-deployed source is 13,038 bytes and hashes to `0x73e4d9bf3e261cb6aa50e901d4c8fe5e86e5a9b049c949d25cc0f7c170cc0c84` because it lacks the local file's single trailing newline. The Solidity is otherwise identical. Sourcify's exact match establishes that the deployed source compiles to the deployed bytecode with optimizer disabled; it does not establish that the deployed source is byte-identical to the frozen source or that the deployed bytecode matches the optimized artifact.

**Local contract tests.** `forge` and `solc` were not installed in this environment, so the Foundry suite was not run locally for this deployment. The recorded Studio run remains 76/76. No tools were installed to force the check.

## Security and trust model

- **No privileged path:** no owner, admin, pause, proxy, upgrade, fee, sweep, rescue, or native-value function. The deployer has no post-deploy privilege.
- **USDC handling:** `SafeERC20`; exact approvals in the UI; state-before-transfer for claim/refund/cancel; `ReentrancyGuard` on the USDC-transfer paths (`createShift`, `claim`, `refundUnused`, `cancel`); `clockIn`/`clockOut`/`attest` have no external calls; no arbitrary token or recipient.
- **One inbound transfer exception:** `createShift` does the inbound `safeTransferFrom` before the state write, documented in the source. This is not an arbitrary external call.
- **Trust anchor:** employer attestation, not proof of work. No dispute path.
- **Privacy:** only public addresses, shift IDs, amounts, timestamps, and tx hashes onchain. No names, emails, locations, tax IDs, or documents. localStorage is a cache, not a source of truth.
- **Arc-specific risks:** USDC blocklist reverts consume gas; native USDC is 18 decimals while the ERC-20 interface is 6; the 20 Gwei floor can drop underpriced transactions.
- **No audit:** do not claim one.

## Repository layout

```text
app/
  contracts/ShiftProof.sol          # frozen contract
  contracts/test/                   # Foundry tests
  contracts/script/Deploy.s.sol     # deploy preflight + deployment
  contracts/out/                    # frozen artifact
  src/                              # Vite + React + wagmi app
  deployments.json                  # testnet record; mainnet lives in src/lib/networks.ts
arc-pipeline/
  03-phase1-report.md
  03-evidence/
  04-mainnet-package.md             # mainnet package
  04-evidence/bytecode-analysis.json
  scripts/verify-mainnet-readonly.sh
```

## Build and test

```bash
cd app
bun install

# The current snapshot does not vendor forge-std:
arc-forge install foundry-rs/forge-std
git -C lib/forge-std rev-parse HEAD

arc-forge build --force
arc-forge test --network arc
bun run check
bunx vite build
```

`VERIFIED` for the Studio 76/76 run and the Phase 1 frontend check/build. `UNVERIFIED` for a local Arc Foundry rebuild in this environment: local Arc Foundry, `lib/forge-std`, and `node_modules` were absent. There is no `bun.lock` in the current snapshot; add one before claiming a reproducible frontend build. `UNRESOLVED`.

## Deploy and verify

Mainnet execution is **human-only** and per-transaction approved. The full commands, approval cards, expected bytecode hashes, and read-only verification script are in [E24]. Do not put a private key in the repo, a shell command, or a chat. The agent never holds a mainnet key.

```bash
# Read-only verification after deploy; no signing, no broadcast:
./arc-pipeline/scripts/verify-mainnet-readonly.sh "$SHIFTPROOF" 1 0

# After shifts A/B/C:
./arc-pipeline/scripts/verify-mainnet-readonly.sh "$SHIFTPROOF" 4 0
```

The verifier checks chain `5042`, `usdc()`, `nextShiftId`, `totalEscrow`, USDC decimals, runtime size/hash, and the exact frozen-artifact comparison with the five immutable USDC bytes patched. On the live deployment, chain ID and public reads pass; the size/hash/exact comparison fails because the Remix deployment used optimizer disabled. The verifier exits `1`. Do not claim the optimized bytecode matches. `VERIFIED` [mainnet-deploy.md](arc-pipeline/03-evidence/mainnet-deploy.md).

**Source verification:** Sourcify reports `creationMatch: exact_match` and `runtimeMatch: exact_match` for [`0x2A88…66a9`](https://repo.sourcify.dev/5042/0x2A88dDe461280F5a3Ad959fd6997388409e766a9). Explorer source verification may still be pending. `VERIFIED` on Sourcify; explorer `UNRESOLVED`.

## Demo (40 USDC cap)

The demo uses three shifts, with both wallets builder-controlled:

| Shift | Escrow | Attest | Paid | Refunded | Final |
|---|---:|---:|---:|---:|---|
| A: 4h × 5 USDC | 20 USDC | 4h | 20 USDC | 0 | `Settled` |
| B: 2h × 5 USDC | 10 USDC | 1h | 5 USDC | 5 USDC | `Settled` |
| C: 1h × 5 USDC | 5 USDC | none | 0 | 5 USDC | `Cancelled` |

Gross escrow 35 USDC; gas cap 0.25 USDC; total committed 35.25 USDC, under the 40 USDC cap. Optional 1 USDC smoke test raises it to 36.25 USDC. `VERIFIED` arithmetic; `UNVERIFIED` execution. The 40 USDC cap is authorized; **no mainnet transaction is authorized without per-card approval** [E24 §5.1].

## Limitations and open items

- No real worker pilot, LOI, or legal review. `UNRESOLVED (waived, not satisfied)`.
- Employer attestation is centralized trust. `VERIFIED`.
- No dispute mechanism. `VERIFIED`.
- No live-USDC testnet E2E with two real wallets. `UNVERIFIED`.
- Sourcify source verification is an exact match; block-explorer verification may still be pending. `VERIFIED` on Sourcify; explorer `UNRESOLVED`.
- Mainnet deployment is live but compiled with optimizer disabled; its runtime bytecode differs from the frozen optimized artifact. `VERIFIED`.
- Public repo and Vercel production deployment are live; video is still a placeholder. `VERIFIED` repo/deployment; `UNRESOLVED` video.
- Local Foundry tests were not run for this deployment because `forge` and `solc` were unavailable. `UNVERIFIED` local rerun; the recorded Studio run remains 76/76.
- Sourcify's deployed source is byte-identical to the frozen source except for one trailing newline, so its source hash differs. `VERIFIED`.
- The app is network-aware: `VITE_NETWORK=testnet` uses the testnet deployment; `VITE_NETWORK=mainnet` uses the mainnet deployment. Mainnet E2E has not been run. `VERIFIED` configuration; `UNVERIFIED` mainnet E2E.
- No `bun.lock`; forge-std commit not pinned; Arc Foundry version not recorded in the artifact. `UNRESOLVED` reproducibility gaps.
- No audit. Do not imply one. `VERIFIED`.

## Network-aware configuration

The app selects its network at build time with `VITE_NETWORK`:

```bash
VITE_NETWORK=testnet npx vite build   # default
VITE_NETWORK=mainnet npx vite build
```

All chain facts live in `app/src/lib/networks.ts`. `app/src/lib/contract.ts` re-exports the active network, and UI copy branches on `ACTIVE_NETWORK.isTestnet`. The testnet entry is unchanged; the mainnet entry is a manual, data-only edit recorded in `app/README.md`.

| Network | Chain ID | Contract | Status |
|---|---|---|---|
| Arc Testnet | `5042002` | `0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6` | Live; testnet funds only |
| Arc Mainnet | `5042` | `0x2A88dDe461280F5a3Ad959fd6997388409e766a9` | Live preview; source-verified on Sourcify; optimizer disabled; not audited |

Missing or malformed mainnet deployment data fails closed: `hasContract` becomes `false`, and contract reads and writes stay disabled.

Remaining testnet-specific documentation: `app/TESTNET-E2E.md`, `app/TESTNET-E2E-LIVE.md`, and the testnet deployment table in `app/AGENTS.md`. `app/src/onchain-facts.ts` contains facts for both networks.

## License

MIT. See [LICENSE](LICENSE).

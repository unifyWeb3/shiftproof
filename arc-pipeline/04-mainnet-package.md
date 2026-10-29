# ShiftProof V1 — Arc Mainnet Package (Phase 2a)

**Prepared:** 2026-10-28 (initial draft 17:09 UTC); **updated 2026-10-29 after C4 closure**  
**Scope:** Phase 2a/2b preparation. No mainnet deployment, transaction, spend, or key handling. Phase 2b public repo and Vercel preview are separately authorized.  
**Decision basis:** `01-decision.md` including the **2026-10-29 05:15 UTC amendment**, `02-architecture-spec.md` §15, `02-decision-log.md` D-24/D-25, `03-phase1-report.md`  
**Status:** **C4 CLOSED; 40 USDC CAP AUTHORIZED; PATH B PRIMARY. MAINNET EXECUTION NOT AUTHORIZED.** The 2026-10-29 amendment closes C4, confirms mainnet USDC in the human wallet, authorizes a 40 USDC total cap including optional S0, and makes Remix + Rabby (Path B) primary. Every mainnet transaction still needs separate human approval; no mainnet deployment, transaction, or key access is authorized. The decision file still shows `<ADDR>` placeholders for the three public wallet addresses.

**Labels used in this package**

| Label | Meaning |
|---|---|
| **VERIFIED** | Directly observed in a file, a public source, a computed hash, or a recorded chain read. |
| **UNVERIFIED** | Prepared or inferred, but not exercised on Arc mainnet. |
| **UNRESOLVED** | A human decision, an external dependency, or a contradiction that must be resolved before execution. |

Existing Phase 1 documents use `[V]`, `[I]`, `[O]`, `[?]`; this package uses the three labels above. When a claim depends on an existing label, the existing evidence link is given.

---

## 0. Read this first

### 0.1 Hard stop

`01-decision.md` §5.1 set a hard checkpoint: **a confirmed route to mainnet USDC (C4) by 2026-10-28 12:00 UTC. If missing, stop and reassess.** The checkpoint was closed on 2026-10-29.

- **2026-10-27 02:05 UTC — route recorded.** “C4: Arc mainnet USDC confirmed in my wallet”; 40 USDC total cap; wallets were `<PUBLIC ADDRESS>` placeholders; mainnet deployment/transactions/private-key handling withheld.
- **2026-10-29 05:15 UTC — C4 CLOSED.** Mainnet USDC confirmed on Arc mainnet. Public wallets are still recorded as `<ADDR>` placeholders. 40 USDC total cap authorized, including optional S0 (36.25 planned). Every mainnet transaction still needs per-transaction approval. Deploy path: **Remix + Rabby (Path B) primary**; Path A dropped unless proven by 2026-10-29. Public repo `shiftproof` and Vercel hosting approved (preview first; production only after mainnet config). Phase 2b authorized. **Mainnet deployment still NOT authorized.**
- `03-phase1-report.md` §5 (2026-10-27) said the cap was “still proposed, not authorized for spend.” The 2026-10-29 amendment supersedes that at the cap level; it does **not** authorize any individual mainnet transaction.

C4 is closed, but execution is not authorized:

- This package may be reviewed and approved as a plan.
- It may **not** be executed as a mainnet deployment without a separate human approval for each transaction and explicit mainnet deploy approval.
- No agent may create, read, hold, or use a mainnet key. No agent may sign or broadcast a mainnet transaction.
- The decision file still uses `<ADDR>` placeholders for deployer/employer/worker. Fill them from the human’s public wallet records; do not generate or invent addresses.
- Path B is primary. Path A is fallback only if Path B fails, Path A is proven by 2026-10-29, and the human re-approves.

**Status: `VERIFIED` — C4 closed and 40 USDC cap authorized. `UNRESOLVED` — actual public addresses/funding route not recorded in the decision file. `UNVERIFIED` — no mainnet execution.**

### 0.2 Gate status

| Gate | Requirement | Status | Evidence / note |
|---|---|---|---|
| C1 | Arc Studio project URL | **VERIFIED** | `https://studio.arc.io/app/35650d11-57a8-4743-8c23-a6bfe1a02f39`; public accessibility unverified. |
| C2 | Real pilot / LOI | **UNRESOLVED (waived, not satisfied)** | `01-decision.md` amendment 2026-10-27 01:42 UTC. Disclosed builder-wallet demo only. |
| C3 | Legal scope | **UNRESOLVED (waived, not satisfied)** | Same amendment. No real worker pilot without a jurisdiction check. |
| C4 | Mainnet route, budget, wallets, funding | **CLOSED 2026-10-29** | C4 closed; 40 USDC cap authorized; every mainnet tx still per-tx approval. Public addresses in the decision file are still `<ADDR>` placeholders; fill from human records. |
| C5 | Host, repo, builder profile | **PARTIAL** | Builder profile URL exists; public repo live at https://github.com/unifyWeb3/shiftproof; Vercel preview live at https://shiftproof-e51a9julz-oxunify.vercel.app (testnet-only); video pending. |
| C6 | Scope discipline | **VERIFIED for V1 scope** | Attested hours + claim + refund; no disputes/QR/tax/lending. |
| C7 | Fallback trigger acknowledged | **VERIFIED** | `01-decision.md` §5.1; PartnerRail is not activated. |
| V1 | Arc Foundry installs | **UNVERIFIED — Path A fallback only** | Install commands prepared; not completed in this environment. Primary Path B does not require it. |
| V2 | `arc-forge` supports `--ledger` / `--account` | **UNVERIFIED — Path A fallback only** | Standard Foundry flags; Arc Foundry build not exercised. |
| V3 | Non-broadcast mainnet run | **UNVERIFIED — Path A fallback only** | No mainnet RPC write/simulation was performed. |
| V4 | Mainnet chain ID and USDC decimals | **VERIFIED** | Docs: chain `5042`; USDC `0x3600…0000`; ERC-20 interface 6 decimals. |
| V5 | Mainnet RPC CORS | **VERIFIED in Phase 1** | `03-phase1-report.md` / Phase 1 evidence. |
| V6 | Explorer source verification path | **UNRESOLVED** | Testnet API returned no source; mainnet API Cloudflare-challenged in Phase 1. |
| V7 | Rabby mainnet signing | **UNVERIFIED** | No mainnet transaction; Path B signing not yet exercised. |
| V8 | Funding route and budget approved | **VERIFIED cap; UNVERIFIED execution** | 40 USDC cap authorized 2026-10-29; every transaction still needs per-tx approval; actual funding route/addresses not recorded. |
| V9 | Runtime bytecode matches frozen build | **UNVERIFIED on mainnet** | Expected hash reconstructed; testnet observation matches. |
| V10 | No mainnet key in agent/repo/Studio | **VERIFIED for this session** | No key was requested, read, stored, or used. |

### 0.3 What this package does not do

- It does not deploy, sign, approve, transfer, or spend.
- It does not add the mainnet entry to `app/deployments.json`.
- It does not change the app from testnet to mainnet.
- It does not itself create the public repo, deploy Vercel, record a video, or submit; Phase 2b actions are tracked separately.
- C4 is closed; C5 repo/Vercel is in progress; source verification and the missing live-USDC testnet E2E remain unresolved.

### 0.4 The one-line state

> C4 is closed and the 40 USDC cap is authorized, but no mainnet deployment, transaction, or key access is authorized. Path B is primary. Source verification, live-USDC E2E, app mainnet config, and submission assets remain incomplete. **Do not deploy.**

---

## 1. Contract and compiler freeze

### 1.1 Source and dependencies

| Item | Value | Status / evidence |
|---|---|---|
| Contract | `ShiftProof` | **VERIFIED** |
| Source path | `app/contracts/ShiftProof.sol:ShiftProof` | **VERIFIED** |
| Source size | 13,039 bytes | **VERIFIED** |
| Source Keccak-256 | `0x5d5e2edb0e2cea4601933f12b2a59bd4e0424d07375323404e0df5c2813ae3ca` | **VERIFIED** — metadata source hash and independent hash agree. |
| OpenZeppelin | `@openzeppelin/contracts` **5.6.1** | **VERIFIED** — `app/package.json` pinned exact version; metadata import remapping. |
| forge-std | Not vendored in the current snapshot | **UNRESOLVED** — tests/scripts need `lib/forge-std`; pin the commit before freezing. |
| Frontend lockfile | No `bun.lock` in the current snapshot | **UNRESOLVED** — frontend dependencies resolve fresh; contract bytecode is unaffected. |
| Contract libraries | None | **VERIFIED** — metadata `libraries: {}`. |
| Remappings | `@openzeppelin/contracts/=node_modules/@openzeppelin/contracts/`; `forge-std/=lib/forge-std/src/` | **VERIFIED** — artifact metadata. |

**Why the source hash matters:** it ties the reviewed source to the compiled artifact. It is not a substitute for explorer source verification, but it makes a source/bytecode mismatch detectable.

### 1.2 Exact compiler settings

| Setting | Value | Status / evidence |
|---|---|---|
| Compiler | `solc 0.8.28+commit.7893614a` | **VERIFIED** — artifact `metadata.compiler.version`. |
| `foundry.toml` `solc_version` | `0.8.28` | **VERIFIED** — `app/foundry.toml`. |
| EVM target | `cancun` | **VERIFIED** — `foundry.toml` and metadata `settings.evmVersion`. |
| Optimizer | enabled, `200` runs | **VERIFIED** — `foundry.toml` and metadata. |
| `viaIR` | `false` / unset | **VERIFIED** — metadata has no `viaIR: true`; Solidity default is false. |
| Metadata bytecode hash | `ipfs` | **VERIFIED** — metadata `settings.metadata.bytecodeHash`. |
| `bytecode_hash = "none"` | Not set | **VERIFIED** — default IPFS metadata suffix is present. |
| Contract path | `contracts/ShiftProof.sol` (project root `app/`) | **VERIFIED** — `foundry.toml` `src = "contracts"`. |
| Test path | `contracts/test` | **VERIFIED** — `foundry.toml`. |
| Script path | `contracts/script` | **VERIFIED** — `foundry.toml`. |
| Arc Foundry version used to build the frozen artifact | Not recorded in the artifact | **UNRESOLVED** — record the exact `arc-forge --version` for the mainnet rebuild. |
| Arc Foundry install target | Official release `v0.8.0-2` observed; use the archive for the host OS/arch | **VERIFIED release exists; UNVERIFIED install in this environment.** |

**Do not change compiler settings between the frozen build and the deploy.** A metadata or optimizer change can change the runtime hash even if the Solidity logic is identical. If a rebuild produces a different hash, stop; do not “fix” the verification by deploying a different build.

### 1.3 Constructor and USDC address

**Constructor source**

```solidity
constructor(address usdc_) {
    if (usdc_ == address(0)) revert ZeroAddress();
    if (IERC20Metadata(usdc_).decimals() != 6) revert InvalidDecimals();
    usdc = usdc_;
    nextShiftId = 1;
}
```

| Item | Value | Status |
|---|---|---|
| Constructor signature | `constructor(address)` | **VERIFIED** |
| Argument | `usdc_ = 0x3600000000000000000000000000000000000000` | **VERIFIED** against Arc docs |
| ABI-encoded argument | `0x0000000000000000000000003600000000000000000000000000000000000000` | **VERIFIED** — computed; matches the USDC argument used in the verified initcode hash. |
| Arc mainnet chain ID | `5042` (`0x13b2`) | **VERIFIED** — [Arc docs: Connect to Arc](https://docs.arc.io/arc/references/connect-to-arc.md). |
| Arc mainnet RPC | `https://rpc.mainnet.arc.io` | **VERIFIED** — same docs. |
| Arc mainnet explorer | `https://explorer.arc.io` | **VERIFIED** — same docs. |
| USDC ERC-20 interface | `0x3600000000000000000000000000000000000000` | **VERIFIED** — [Arc docs: Contract addresses](https://docs.arc.io/arc/references/contract-addresses.md). |
| USDC ERC-20 decimals | `6` | **VERIFIED** — same docs; constructor enforces it. |
| Native USDC gas decimals | `18` | **VERIFIED** — same docs; do not mix with ERC-20 amounts. |

**Docs statement (paraphrased, not a quote):** Arc mainnet and testnet use the same USDC address, `0x3600000000000000000000000000000000000000`; it is an optional ERC-20 interface over the native USDC balance and uses 6 decimals. The native gas token uses 18 decimals. The two interfaces share one underlying balance.

**Explorer check**

- Mainnet USDC page: `https://explorer.arc.io/address/0x3600000000000000000000000000000000000000`
- The automated mainnet explorer API read was Cloudflare-challenged and returned a “Just a moment...” HTML page, not JSON. **Status: `UNRESOLVED` for automated explorer confirmation.**
- **Human pre-sign check:** open the explorer link in a clean browser, confirm the address, label `USDC`, and `decimals()` = `6` in the Read Contract tab. If the label, address, or decimals differ, stop.
- The post-deploy read-only script also reads `decimals()` and `symbol()` from the token. **Status: prepared; `UNVERIFIED` on mainnet.**

**Critical unit warning**

| Use | Amount format | Example |
|---|---|---|
| ERC-20 escrow / `approve` / `createShift` | 6-decimal base units | `20 USDC = 20000000` |
| Native gas balance / `maxFeePerGas` | 18-decimal native units | `0.01 USDC gas = 10000000000000000` wei |
| Wallet display | May show one or both | Confirm the token contract and decimals before signing. |

**Do not** pass `20e18` or `20_000_000_000_000_000_000` to `approve` or `createShift`. The contract uses 6-decimal ERC-20 units. A 10¹² error is the most likely way to lose the budget or revert.

### 1.4 Bytecode hashes and sizes

All hashes below are **Keccak-256**, not NIST SHA3-256. The reproducible computation is in `arc-pipeline/04-evidence/bytecode-analysis.json`.

| Object | Bytes | Keccak-256 | Status |
|---|---:|---|---|
| Creation code (artifact `bytecode.object`, no constructor arg) | 6,392 | `0x379b47bd04762da80e35d34025fb9656e9b16f9243bad00851421fd433cbb5ad` | **VERIFIED** |
| Initcode (creation code + 32-byte USDC argument) | 6,424 | `0xff7d1c3059cc1d5af02576e3659c2f300f4ce33f29bcb263ede4235d869b7a37` | **VERIFIED** |
| Runtime artifact with zeroed immutable slots | 5,990 | `0xd76ac4fd9070d98a1faa08865da36eb2111f634762945c1234e8391e4cdbdca1` | **VERIFIED** |
| Runtime with USDC immutable patched — **expected mainnet** | 5,990 | `0x843ef44664f6eb7bbbe95c213d6fd60b88d912b3810d087981ab69a94b90b1e5` | **VERIFIED by reconstruction; UNVERIFIED on mainnet** |
| Testnet deployed runtime | 5,990 | `0x843ef44664f6eb7bbbe95c213d6fd60b88d912b3810d087981ab69a94b90b1e5` | **VERIFIED** — `03-evidence/s3-onchain-verification.json` |
| Mainnet deployed runtime | — | — | **UNVERIFIED** — no deployment. |

**Why the mainnet expected hash equals the testnet observed hash:** the runtime bytecode depends on the compiler settings, source, and the immutable USDC address — not on chain ID or contract address. Both networks use the same USDC address. The testnet deployment therefore already demonstrates the exact expected mainnet runtime hash. This is strong evidence, but it is **not** an observation of a mainnet deployment.

### 1.5 Immutable USDC bytes

| Runtime byte offset | Artifact 20 bytes | Expected mainnet 20 bytes | Differing byte |
|---:|---|---|---|
| 395 | `0x0000000000000000000000000000000000000000` | `0x3600000000000000000000000000000000000000` | byte 395: `0x00` → `0x36` |
| 1,474 | `0x0000000000000000000000000000000000000000` | `0x3600000000000000000000000000000000000000` | byte 1,474: `0x00` → `0x36` |
| 1,932 | `0x0000000000000000000000000000000000000000` | `0x3600000000000000000000000000000000000000` | byte 1,932: `0x00` → `0x36` |
| 2,394 | `0x0000000000000000000000000000000000000000` | `0x3600000000000000000000000000000000000000` | byte 2,394: `0x00` → `0x36` |
| 4,141 | `0x0000000000000000000000000000000000000000` | `0x3600000000000000000000000000000000000000` | byte 4,141: `0x00` → `0x36` |

Only **five bytes** differ across the entire 5,990-byte runtime. The remaining 19 bytes of each 20-byte region are zero because the USDC address ends in 19 zero bytes. The artifact-vs-testnet comparison independently found exactly these five differing offsets. **Status: `VERIFIED`.**

**Interpretation:** when the read-only script says “exact bytecode comparison,” it patches these five regions into the artifact and compares the full runtime byte-for-byte. A metadata-only difference, a compiler difference, or a source difference will show up as additional diffs; those are not explained by immutables.

### 1.6 Evidence files

| File | Contents |
|---|---|
| `arc-pipeline/04-evidence/bytecode-analysis.json` | Full hash/size/offset record and method. |
| `app/contracts/out/ShiftProof.sol/ShiftProof.json` | Frozen artifact, metadata, ABI, bytecode. |
| `arc-pipeline/03-evidence/s3-onchain-verification.json` | Testnet code and reads. |
| `arc-pipeline/03-evidence/deployments-current.json` | Testnet deployment record. |

---

## 2. Deploy path

### 2.1 Primary path and fallback status

**Primary: Path B — Remix + Rabby**, per the **2026-10-29 05:15 UTC amendment**. Path A (Arc Foundry + human hardware wallet) was the earlier architecture recommendation; it is **dropped unless proven by 2026-10-29** and may be used only as a fallback after fresh human approval.

**Path B is approved as the path, not as a deployment authorization.** The 2026-10-29 amendment still withholds mainnet deployment and requires separate approval for every mainnet transaction. Rabby mainnet signing is `UNVERIFIED`; the Remix procedure in §2.11 has not been exercised on mainnet.

**Status: `VERIFIED` path decision; `UNVERIFIED` mainnet procedure.**

### 2.2 Preconditions (all must be true before any broadcast)

- [ ] **C4 is closed and the actual public addresses are filled in:** deployer, employer, worker, grant recipient (if any), and funding source. The 2026-10-29 amendment closes C4 but still records the three wallets as `<ADDR>` placeholders; do not invent them.
- [ ] **Spend approval:** the 40 USDC cap is authorized, but no individual mainnet transaction is authorized by this package. Each transaction needs the human’s per-card approval; the deploy also needs a separate deploy approval.
- [ ] **C5 assets:** public repo `shiftproof` and Vercel preview authorized; preview is live at https://shiftproof-e51a9julz-oxunify.vercel.app; record the repo URL once pushed; builder profile URL exists.
- [ ] **Feature freeze:** exact commit/tag recorded; `git status` clean; no uncommitted contract or script changes.
- [ ] **Artifact frozen:** source hash, creation hash, initcode hash, runtime hash, compiler settings recorded in this package.
- [ ] **Path B ready:** Rabby installed on the human device, Remix compiler/optimizer settings match §2.11, and the constructor argument is entered correctly.
- [ ] **If Path A is used as fallback:** Arc Foundry installed and V1–V3 recorded (`arc-forge --version`, `--ledger`/`--account` support, non-broadcast mainnet run), with fresh human approval.
- [ ] **Mainnet deployer funded** with at least the gas buffer; no other pending transaction from the deployer.
- [ ] **Human has read this package and signed the deploy approval card.**
- [ ] **No mainnet key in the agent, repo, shell history, or Studio.**
- [ ] **Path decision documented:** 2026-10-29 amendment makes Path B primary; Path A is fallback only.

> **Path A fallback only.** Path B (Remix + Rabby) is primary. The Path A commands below are retained in case Path B fails, Path A is proven by 2026-10-29, and the human re-approves. Do not use them as the default mainnet procedure.

### 2.3 Install Arc Foundry (Path A fallback, human machine)

Official docs: [Install Arc Foundry](https://docs.arc.io/arc/tutorials/install-arc-foundry.md). Release page: `https://github.com/circlefin/arc-foundry/releases`.

```bash
# Pick the archive for the host OS/arch. Example target names:
#   aarch64-unknown-linux-gnu
#   x86_64-unknown-linux-gnu
# The release page is authoritative; do not guess a target name.
cd /tmp
curl -LO "https://github.com/circlefin/arc-foundry/releases/download/v0.8.0-2/arc-foundry-v0.8.0-2-<TARGET>.tar.gz"
curl -LO "https://github.com/circlefin/arc-foundry/releases/download/v0.8.0-2/arc-foundry-v0.8.0-2-<TARGET>.tar.gz.sha256"
sha256sum -c "arc-foundry-v0.8.0-2-<TARGET>.tar.gz.sha256"
tar -xzf "arc-foundry-v0.8.0-2-<TARGET>.tar.gz"

mkdir -p "$HOME/.local/bin"
mv forge "$HOME/.local/bin/arc-forge"
mv cast  "$HOME/.local/bin/arc-cast"
mv anvil "$HOME/.local/bin/arc-anvil"
export PATH="$HOME/.local/bin:$PATH"

arc-forge --version
arc-cast --version
```

**Status:** install commands match the official docs; the download/install was **not completed in this environment**. **`UNVERIFIED`.**

**V2 check (before relying on the ledger flag):**

```bash
arc-forge script --help | grep -E -- '--ledger|--account|--sender|--broadcast|--slow'
arc-forge create --help | grep -E -- '--ledger|--account|--constructor-args|--broadcast'
arc-cast send --help | grep -E -- '--ledger|--from|--gas-limit'
```

Record the exact help output. If `--ledger` is absent, use `--account ⟨NAME⟩` with an encrypted keystore that the human controls, or fall back to Path B. Do not use `--private-key` in a command the agent can see.

### 2.4 Build and freeze the artifact

```bash
cd app
bun install
# The current snapshot has no lib/forge-std. If it is missing:
arc-forge install foundry-rs/forge-std
# Record the installed commit; do not silently float it:
git -C lib/forge-std rev-parse HEAD

arc-forge build --force
arc-forge test --network arc
bun run check
```

**Status:** `bun install`, `arc-forge build`, `arc-forge test --network arc`, and `bun run check` are **UNVERIFIED in this environment** because local Arc Foundry, `lib/forge-std`, and `node_modules` are absent. Phase 1's Studio run already produced 76/76 tests; that evidence is testnet/Studio, not a local mainnet rebuild.

**Artifact acceptance check:**

```bash
cd app

ARTIFACT_RUNTIME=$(python3 - <<'PY'
import json
print(json.load(open('contracts/out/ShiftProof.sol/ShiftProof.json'))['deployedBytecode']['object'])
PY
)
arc-cast keccak "$ARTIFACT_RUNTIME"
# Expected: 0xd76ac4fd9070d98a1faa08865da36eb2111f634762945c1234e8391e4cdbdca1

ARTIFACT_CREATION=$(python3 - <<'PY'
import json
print(json.load(open('contracts/out/ShiftProof.sol/ShiftProof.json'))['bytecode']['object'])
PY
)
CONSTRUCTOR_ARGS=$(arc-cast abi-encode "constructor(address)" 0x3600000000000000000000000000000000000000)
arc-cast keccak "${ARTIFACT_CREATION}${CONSTRUCTOR_ARGS#0x}"
# Expected: 0xff7d1c3059cc1d5af02576e3659c2f300f4ce33f29bcb263ede4235d869b7a37
```

If either hash differs, stop. Do not change the expected values to match a different build. The source hash must also still be `0x5d5e…e3ca`.

### 2.5 Mainnet preflight (read-only)

Run these in the human's terminal. They are reads; no key is needed.

```bash
export ARC_MAINNET_RPC_URL="https://rpc.mainnet.arc.io"
export USDC="0x3600000000000000000000000000000000000000"
export DEPLOYER="<DEPLOYER_PUBLIC_ADDRESS>"

arc-cast chain-id --rpc-url "$ARC_MAINNET_RPC_URL"
# Must be 5042. If it is 5042002, the RPC is testnet. Stop.

arc-cast balance "$DEPLOYER" --rpc-url "$ARC_MAINNET_RPC_URL" --ether
# Must be >= 0.50 (native 18-decimal USDC). This is the gas buffer.

arc-cast call "$USDC" "decimals()(uint8)" --rpc-url "$ARC_MAINNET_RPC_URL"
# Must be 6.

arc-cast call "$USDC" "symbol()(string)" --rpc-url "$ARC_MAINNET_RPC_URL"
# Should be USDC. If not, stop and investigate.

arc-cast nonce "$DEPLOYER" --rpc-url "$ARC_MAINNET_RPC_URL"
# Record it. After a successful deploy it must be +1.
```

**Important discrepancy:** `03-phase1-report.md` §1 and `02-architecture-spec.md` §15.5 step 2 say `Deploy.s.sol` asserts a deployer gas balance. **The actual `app/contracts/script/Deploy.s.sol` does not.** It checks chain ID, non-zero USDC, and `decimals() == 6` only. The external `arc-cast balance` check above is therefore mandatory. **Status: `UNRESOLVED` documentation/code discrepancy.**

**Important discrepancy:** `Deploy.s.sol` accepts both `5042` and `5042002`. A mainnet deploy must never rely on the script alone to distinguish mainnet from testnet. The `arc-cast chain-id` check and the RPC URL are the mainnet guards.

### 2.6 Dry run (no broadcast)

```bash
cd app

export ARC_MAINNET_RPC_URL="https://rpc.mainnet.arc.io"
export DEPLOYER="<DEPLOYER_PUBLIC_ADDRESS>"

arc-forge script contracts/script/Deploy.s.sol:Deploy \
  --rpc-url "$ARC_MAINNET_RPC_URL" \
  --chain 5042 \
  --sender "$DEPLOYER" \
  --gas-limit 2500000 \
  -vvv
```

**No `--broadcast`.** This should simulate the deployment, print the chain, USDC, predicted address, `nextShiftId`, and gas estimate. The `decimals() == 6` assertion is enforced by `require` but not printed; run the preflight `arc-cast call` separately. No signature is needed.

Review and record:

- `block.chainid` = 5042.
- `USDC_ARC` = `0x3600…0000`.
- `decimals()` = 6.
- Predicted contract address.
- Estimated gas and `maxFeePerGas` requirement.
- Deployer nonce.
- Any warning about metadata, compiler, or script path.

If `--chain` is rejected by the installed Arc Foundry build, drop it and rely on the RPC + `arc-cast chain-id` check; record the deviation. If the dry run fails, stop; do not broadcast to “see what happens.”

### 2.7 Broadcast (human-only)

**Do not run this until the deploy approval card is signed.** The agent must not run this command.

```bash
cd app

export ARC_MAINNET_RPC_URL="https://rpc.mainnet.arc.io"
export DEPLOYER="<DEPLOYER_PUBLIC_ADDRESS>"

arc-forge script contracts/script/Deploy.s.sol:Deploy \
  --rpc-url "$ARC_MAINNET_RPC_URL" \
  --chain 5042 \
  --sender "$DEPLOYER" \
  --ledger \
  --gas-limit 2500000 \
  --broadcast \
  --slow \
  -vvv
```

**On the hardware wallet, verify all of the following before signing:**

| Device prompt | Expected |
|---|---|
| Network / chain | Arc Mainnet, chain **5042** |
| Transaction type | Contract creation (no recipient) |
| Value | **0** native USDC |
| Gas limit | **≤ 2,500,000** |
| Max fee per gas | **≤ 30 Gwei** (20 Gwei is the protocol floor; 30 Gwei is the cap for this package) |
| Constructor argument | USDC `0x3600…0000`; verify via the advanced/data display if available |
| Deployer | The human's Ledger address, matching `--sender` |

If any prompt differs, **reject on the device** and stop. A rejected signature is a successful safety check, not a failed deployment.

**Status of these exact flags:** `--rpc-url`, `--sender`, `--ledger`, `--gas-limit`, `--broadcast`, `--slow`, `-vvv` are standard Foundry flags, but the Arc Foundry build was not exercised here. **`UNVERIFIED`.**

### 2.8 Confirm the receipt and record the deployment

```bash
cd "$(git rev-parse --show-toplevel)"
export ARC_MAINNET_RPC_URL="https://rpc.mainnet.arc.io"
export CONTRACT="<DEPLOYED_ADDRESS>"
export DEPLOY_TX="<DEPLOY_TX_HASH>"

arc-cast receipt "$DEPLOY_TX" --rpc-url "$ARC_MAINNET_RPC_URL" --json
arc-cast code "$CONTRACT" --rpc-url "$ARC_MAINNET_RPC_URL"
arc-cast call "$CONTRACT" "usdc()(address)" --rpc-url "$ARC_MAINNET_RPC_URL"
arc-cast call "$CONTRACT" "nextShiftId()(uint256)" --rpc-url "$ARC_MAINNET_RPC_URL"
arc-cast call "$CONTRACT" "totalEscrow()(uint256)" --rpc-url "$ARC_MAINNET_RPC_URL"

./arc-pipeline/scripts/verify-mainnet-readonly.sh "$CONTRACT" 1 0
```

Expected:

- Receipt status `1`.
- `code` length 5,990 bytes.
- `usdc()` = `0x3600…0000`.
- `nextShiftId()` = `1`.
- `totalEscrow()` = `0`.
- Runtime hash = `0x843e…b1e5`.
- Full bytecode comparison passes with the five immutable bytes patched.
- Deployer nonce increased by exactly 1.
- Explorer shows the contract address and creation tx.

**If any check fails: do not fund the contract.** Record the address as unusable and stop. There is no admin rescue.

### 2.9 Record template

Create `arc-pipeline/04-evidence/deployments-mainnet.json` only after a successful deployment. Do not pre-fill a fake address.

```json
{
  "ShiftProof": {
    "arcMainnet": {
      "chainId": 5042,
      "network": "ARC-MAINNET",
      "address": "<DEPLOYED_ADDRESS>",
      "txHash": "<DEPLOY_TX_HASH>",
      "deploymentBlock": 0,
      "deployedAt": "<UTC_TIMESTAMP>",
      "deployer": "<DEPLOYER_PUBLIC_ADDRESS>",
      "usdc": "0x3600000000000000000000000000000000000000",
      "explorerUrl": "https://explorer.arc.io/address/<DEPLOYED_ADDRESS>",
      "verified": false,
      "verificationStatus": "UNRESOLVED",
      "compiler": "0.8.28+commit.7893614a",
      "evmVersion": "cancun",
      "optimizer": { "enabled": true, "runs": 200 },
      "constructorArgs": ["0x3600000000000000000000000000000000000000"],
      "runtimeBytes": 5990,
      "runtimeKeccak256": "0x843ef44664f6eb7bbbe95c213d6fd60b88d912b3810d087981ab69a94b90b1e5",
      "approvalLog": "arc-pipeline/04-approvals.md"
    }
  }
}
```

`verified` stays `false` until the explorer shows the source/ABI on the contract page. Set `verificationStatus` to `source-published` or `explorer-verified` only when that is true. A published source file and a matching bytecode hash are **not** explorer verification.

### 2.10 Source verification

Try the CLI first, from `app/`:

```bash
export CONTRACT="<DEPLOYED_ADDRESS>"
export USDC="0x3600000000000000000000000000000000000000"
export CONSTRUCTOR_ARGS=$(arc-cast abi-encode "constructor(address)" "$USDC")

arc-forge verify-contract "$CONTRACT" contracts/ShiftProof.sol:ShiftProof \
  --chain-id 5042 \
  --verifier blockscout \
  --verifier-url https://explorer.arc.io/api/ \
  --compiler-version 0.8.28 \
  --num-of-optimizations 200 \
  --constructor-args "$CONSTRUCTOR_ARGS" \
  --watch
```

**Status:** the command shape is inferred from the documented testnet command; the mainnet API and flags are **`UNVERIFIED`**. The testnet explorer API already returned bytecode only and no source/ABI. If the API returns 403/Cloudflare HTML, do not keep retrying blindly.

**Manual fallback:** open `https://explorer.arc.io` and use the explorer’s Verify Contract flow (the exact path `/contract-verification` is `UNVERIFIED`), then submit:

- Address: the deployed address.
- Compiler: `0.8.28+commit.7893614a`.
- EVM version: `cancun`.
- Optimizer: enabled, 200 runs.
- `viaIR`: no.
- Constructor args: `0x0000000000000000000000003600000000000000000000000000000000000000`.
- Source: the **standard JSON input** from the frozen build if the UI supports it, not a hand-flattened file. Flattening changes source paths and metadata, which can change the bytecode hash.

If verification still fails:

1. Publish the exact source, compiler settings, constructor arg, creation code hash, initcode hash, and runtime hash in the repo.
2. Set `verified: false` and `verificationStatus: "source-published"`.
3. Say **“source published; explorer verification pending.”**
4. Never say “verified,” “audited,” or “source matches” unless the explorer shows it.

### 2.11 Remix + Rabby (PRIMARY path)

**Status: PRIMARY PATH; `UNVERIFIED` on mainnet.** Remix can compile the contract, but manual settings and import resolution are the most likely sources of a bytecode mismatch. Flattening the OZ imports changes metadata and may change the runtime hash.

Use this path per the 2026-10-29 amendment. Path A is fallback only after fresh human approval. Do not import a wallet seed or private key into Remix.

1. Open Remix in a clean browser profile. Do not import a wallet seed or private key into Remix.
2. Create `contracts/ShiftProof.sol` with the exact 13,039-byte source at commit `⟨FREEZE_COMMIT⟩`.
3. Resolve OpenZeppelin **5.6.1**:
   - Preferred: use a local Remix workspace connected to the repo's `node_modules/@openzeppelin/contracts` via `remixd`.
   - Alternative: use Remix's npm import resolution for `@openzeppelin/contracts@5.6.1`.
   - Last resort: flatten. **Record that flattening changes metadata and likely changes the bytecode hash.**
4. Compiler tab:
   - Compiler `0.8.28`.
   - EVM version `cancun`.
   - Enable optimization, **200** runs.
   - Do **not** enable `viaIR`.
   - Metadata bytecode hash `ipfs` if the UI exposes it.
5. Deploy tab:
   - Environment: Injected Provider — Rabby.
   - Network: Arc Mainnet, chain **5042**.
   - Contract: `ShiftProof`.
   - Constructor argument: `0x3600000000000000000000000000000000000000`.
   - Gas limit: **2,500,000**.
   - Max fee: **≥ 20 Gwei and ≤ 30 Gwei**; reject if Rabby shows otherwise.
6. Before signing, confirm Rabby shows Arc Mainnet, contract creation, value 0, and the constructor argument (if displayed).
7. After deployment, run `verify-mainnet-readonly.sh` and compare the runtime hash. **If it is not `0x843e…b1e5`, stop and do not fund the contract.** A Remix build that differs is not the frozen build.
8. Verify in the explorer UI. If the source was flattened, expect a possible mismatch; do not claim verified.
9. Record the Remix compiler version, settings, address, tx, and hash in the deployment record.

### 2.12 Failure and rollback

| Scenario | Action |
|---|---|
| Arc Foundry install fails | Record the failure; use Path B only after fresh approval. If both fail, return to Gate A; do not invent a third path. |
| `--ledger` unsupported | Try `--account` with a human-controlled encrypted keystore; otherwise Path B. Never use an agent-held key. |
| Dry run fails | Stop; fix the cause; re-run. Do not broadcast. |
| Broadcast reverts | No contract; record the failed tx; fix; new approval; redeploy. |
| Deploy succeeds, wrong USDC arg | Do not fund; deploy a new contract; mark the bad address unusable. |
| Runtime hash mismatch | Stop; do not fund; investigate compiler/settings; redeploy only with a new approval. |
| Verification fails | Publish source/hash; label “source published, verification pending”; do not claim verified. |
| C4 closed but actual public addresses/funding not in the decision file | Stop before any deployment; fill from human public records; do not generate addresses. |
| Path B fails and Path A is not proven by 2026-10-29 | Return to Gate A / human decision; do not invent a third path. |
| Key exposure | New wallet; move remaining funds; disclose; do not reuse. |

There is no onchain rollback. The small budget and per-shift escrow are the loss controls.

## 3. Per-transaction approval cards

### 3.1 Rules

- Every card is one transaction, one human signature, one receipt.
- No batching, no “approve all,” no agent signing, no private key in a command.
- The human reads the card, checks the wallet prompt, and types `APPROVE ⟨CARD_ID⟩ 5042` in the approval log before signing.
- If the wallet prompt differs from the card in **chain, contract, function, amount, recipient, gas limit, or max fee**, reject on the device and stop.
- A card is not approved until the human has also confirmed the current state by read-only calls. The agent may prepare the calls; the human runs them or watches the output.
- The approval log is `arc-pipeline/04-approvals.md`. It does not exist yet. Create it at execution time; do not pre-sign.

**Every card below is on:**

- Chain: **Arc Mainnet, chain ID 5042**
- ShiftProof: `⟨SHIFTPROOF⟩` (the address deployed by card D-01)
- Token: **USDC** `0x3600000000000000000000000000000000000000`, ERC-20 interface, **6 decimals**
- Status: **PROPOSED — not signed**

### 3.2 Card template

| Field | Value |
|---|---|
| Card ID / status | `⟨D-01 / A-01 / …⟩` — `PROPOSED` |
| Network | Arc Mainnet |
| Chain ID | `5042` |
| ShiftProof contract | `⟨SHIFTPROOF⟩` |
| Token contract | USDC `0x3600000000000000000000000000000000000000` |
| Token decimals | `6` (ERC-20 interface) |
| Function / selector | `⟨signature⟩` / `⟨0x…⟩` |
| Arguments | `⟨exact ABI values⟩` |
| From (role / address) | `⟨deployer / employer / worker⟩` / `⟨0x…⟩` |
| To (contract) | `⟨SHIFTPROOF⟩` or USDC `⟨0x3600…0000⟩` |
| USDC amount (base units) | `⟨integer⟩` |
| USDC amount (decimal) | `⟨x.xxxxxx USDC⟩` |
| Recipient of funds | `⟨worker / employer / ShiftProof escrow / none⟩` |
| Expected state change | `⟨balances, allowance, shift status, nextShiftId, totalEscrow⟩` |
| Gas limit cap | `⟨integer⟩` |
| Max fee cap | `30 Gwei` |
| Max gas cost cap | `⟨USDC amount⟩` |
| Preconditions | `⟨chain, code hash, USDC, balances, allowance, simulation⟩` |
| Abort if | `⟨mismatch list⟩` |
| Human approval (name) | `________________` |
| Approval time (UTC) | `________________` |
| Wallet address shown on device | `________________` |
| Tx hash | `0x…` |
| Receipt status / block | `1 / ⟨block⟩` |
| Explorer URL | `https://explorer.arc.io/tx/⟨tx⟩` |
| Approval log entry | `APPROVE ⟨CARD_ID⟩ 5042` |

### 3.3 Deploy card

| Card | Signer | Function | USDC amount | Recipient | Expected state change | Gas cap |
|---|---|---|---:|---|---|---:|
| **D-01** | Deployer `⟨DEPLOYER⟩` | `new ShiftProof(0x3600…0000)` via `Deploy.s.sol` | `0` | New contract address | Code at predicted address; `usdc()=0x3600…0000`; `nextShiftId=1`; `totalEscrow=0`; deployer nonce +1; gas only | `2,500,000` gas / `0.075 USDC` |

**D-01 preconditions**

- `arc-cast chain-id` = `5042`.
- Deployer native balance ≥ `0.50` USDC.
- `USDC.decimals()` = `6`; `USDC.symbol()` = `USDC`.
- Dry run printed the expected chain, USDC, and predicted address.
- The frozen artifact hashes match §1.4.
- No other pending transaction from the deployer.
- Human has signed this card and the C4 closure plus per-transaction spend approval.

**D-01 abort if**

- Wallet shows any chain other than `5042`.
- Wallet shows value other than `0`.
- Gas limit > `2,500,000` or max fee > `30 Gwei`.
- Constructor data does not contain `0x3600…0000`.
- Dry run reverted or predicted address differs from the recorded expectation.
- Any artifact hash differs.

### 3.4 Shift A cards — 4h × 5 USDC = 20 USDC escrow

| Card | Signer | Function | USDC amount | Recipient | Expected state change | Gas cap |
|---|---|---|---:|---|---|---:|
| **A-01** | Employer | `approve(ShiftProof, 20000000)` on USDC | `20.000000` | Spender = ShiftProof; no token leaves the wallet | Allowance `0 → 20,000,000`; employer USDC balance unchanged; `nextShiftId` unchanged | `100,000` / `0.003 USDC` |
| **A-02** | Employer | `createShift(worker, 5000000, 14400)` | `20.000000` | ShiftProof escrow | Employer `-20,000,000`; contract `+20,000,000`; `totalEscrow 0 → 20,000,000`; `nextShiftId 1 → 2`; shift 1 `Funded`, escrow `20,000,000`, owed `0`; allowance `20,000,000 → 0` | `300,000` / `0.009 USDC` |
| **A-03** | Worker | `clockIn(1)` | `0` | None | Shift 1 `Funded → Active`; `startedAt` set; balances unchanged | `100,000` / `0.003 USDC` |
| **A-04** | Worker | `clockOut(1)` | `0` | None | Shift 1 `Active → AwaitingAttestation`; `endedAt` set; balances unchanged | `100,000` / `0.003 USDC` |
| **A-05** | Employer | `attest(1, 14400)` | `0` | None | Shift 1 `AwaitingAttestation → Attested`; `attestedSeconds=14400`; `owed=20,000,000`; `escrow=20,000,000`; `totalEscrow=20,000,000` | `150,000` / `0.0045 USDC` |
| **A-06** | Worker | `claim(1)` | `20.000000` | Worker | Worker `+20,000,000`; contract `-20,000,000`; shift `owed 0`, `escrow 0`; `totalEscrow 20,000,000 → 0`; status `Settled` | `150,000` / `0.0045 USDC` |

### 3.5 Shift B cards — 2h × 5 USDC = 10 USDC escrow; attest 1h; refund 5; claim 5

| Card | Signer | Function | USDC amount | Recipient | Expected state change | Gas cap |
|---|---|---|---:|---|---|---:|
| **B-01** | Employer | `approve(ShiftProof, 10000000)` on USDC | `10.000000` | Spender = ShiftProof; no token leaves the wallet | Allowance `0 → 10,000,000`; balance unchanged | `100,000` / `0.003 USDC` |
| **B-02** | Employer | `createShift(worker, 5000000, 7200)` | `10.000000` | ShiftProof escrow | Employer `-10,000,000`; contract `+10,000,000`; `totalEscrow 0 → 10,000,000`; `nextShiftId 2 → 3`; shift 2 `Funded`, escrow `10,000,000`; allowance `10,000,000 → 0` | `300,000` / `0.009 USDC` |
| **B-03** | Worker | `clockIn(2)` | `0` | None | Shift 2 `Funded → Active`; `startedAt` set | `100,000` / `0.003 USDC` |
| **B-04** | Worker | `clockOut(2)` | `0` | None | Shift 2 `Active → AwaitingAttestation`; `endedAt` set | `100,000` / `0.003 USDC` |
| **B-05** | Employer | `attest(2, 3600)` | `0` | None | Shift 2 `AwaitingAttestation → Attested`; `attestedSeconds=3600`; `owed=5,000,000`; `escrow=10,000,000`; `totalEscrow=10,000,000` | `150,000` / `0.0045 USDC` |
| **B-06** | Employer (or any address; funds always go to employer) | `refundUnused(2)` | `5.000000` | Employer | Employer `+5,000,000`; contract `-5,000,000`; `escrow 10,000,000 → 5,000,000`; `totalEscrow 10,000,000 → 5,000,000`; status remains `Attested` | `150,000` / `0.0045 USDC` |
| **B-07** | Worker | `claim(2)` | `5.000000` | Worker | Worker `+5,000,000`; contract `-5,000,000`; `escrow 5,000,000 → 0`; `owed 0`; `totalEscrow 5,000,000 → 0`; status `Settled` | `150,000` / `0.0045 USDC` |

### 3.6 Shift C cards — 1h × 5 USDC = 5 USDC escrow; cancel before clock-in

| Card | Signer | Function | USDC amount | Recipient | Expected state change | Gas cap |
|---|---|---|---:|---|---|---:|
| **C-01** | Employer | `approve(ShiftProof, 5000000)` on USDC | `5.000000` | Spender = ShiftProof; no token leaves the wallet | Allowance `0 → 5,000,000`; balance unchanged | `100,000` / `0.003 USDC` |
| **C-02** | Employer | `createShift(worker, 5000000, 3600)` | `5.000000` | ShiftProof escrow | Employer `-5,000,000`; contract `+5,000,000`; `totalEscrow 0 → 5,000,000`; `nextShiftId 3 → 4`; shift 3 `Funded`, escrow `5,000,000`; allowance `5,000,000 → 0` | `300,000` / `0.009 USDC` |
| **C-03** | Employer | `cancel(3)` | `5.000000` | Employer | Employer `+5,000,000`; contract `-5,000,000`; `escrow 0`; `totalEscrow 5,000,000 → 0`; status `Cancelled` | `150,000` / `0.0045 USDC` |

**Total A/B/C: 17 transactions** (1 deploy + 16 shift transactions). The optional S0 smoke test adds 6 transactions and shifts the IDs by 1; see §5.10.

### 3.7 Filled example — card A-02

| Field | Value |
|---|---|
| Card ID / status | `A-02` — `PROPOSED` |
| Network / chain | Arc Mainnet / `5042` |
| ShiftProof contract | `⟨SHIFTPROOF⟩` |
| Token | USDC `0x3600000000000000000000000000000000000000`, 6 decimals |
| Function / selector | `createShift(address,uint256,uint32)` / `0x47eb17a1` |
| Arguments | `worker=⟨WORKER⟩`; `hourlyRate=5000000`; `maxSeconds=14400` |
| From | Employer `⟨EMPLOYER⟩` |
| To | ShiftProof `⟨SHIFTPROOF⟩` |
| Amount | `20,000,000` base units = `20.000000 USDC` |
| Recipient of funds | ShiftProof escrow |
| Expected state change | Employer `-20,000,000`; contract `+20,000,000`; `totalEscrow 0 → 20,000,000`; `nextShiftId 1 → 2`; shift 1 `Funded`, escrow `20,000,000`; allowance `20,000,000 → 0` |
| Gas limit cap | `300,000` |
| Max fee cap | `30 Gwei` |
| Max gas cost cap | `0.009 USDC` |
| Preconditions | chain 5042; runtime hash `0x843e…b1e5`; `USDC.decimals()=6`; employer USDC ≥ `20.25`; allowance exactly `20,000,000`; simulation succeeds; `nextShiftId=1` |
| Abort if | any chain/contract/token/amount/recipient mismatch; allowance not `20,000,000`; balance below `20.25`; simulation reverts; gas prompt above the cap |
| Human approval | `________________` |
| Approval time (UTC) | `________________` |
| Wallet address on device | `________________` |
| Tx hash | `0x…` |
| Receipt / block | `1 / ⟨block⟩` |
| Explorer | `https://explorer.arc.io/tx/⟨tx⟩` |
| Log entry | `APPROVE A-02 5042` |

**Pre-sign simulation (read-only; run by the human):**

```bash
export RPC="https://rpc.mainnet.arc.io"
export SHIFTPROOF="<SHIFTPROOF>"
export USDC="0x3600000000000000000000000000000000000000"
export EMPLOYER="<EMPLOYER>"
export WORKER="<WORKER>"

arc-cast call "$USDC" "balanceOf(address)(uint256)" "$EMPLOYER" --rpc-url "$RPC"
arc-cast call "$USDC" "allowance(address,address)(uint256)" "$EMPLOYER" "$SHIFTPROOF" --rpc-url "$RPC"
arc-cast call "$SHIFTPROOF" "nextShiftId()(uint256)" --rpc-url "$RPC"
arc-cast call "$SHIFTPROOF" "totalEscrow()(uint256)" --rpc-url "$RPC"
arc-cast call "$SHIFTPROOF" "createShift(address,uint256,uint32)" \
  "$WORKER" 5000000 14400 --from "$EMPLOYER" --rpc-url "$RPC"
```

The last command simulates the call against current state; it does not persist. If it reverts, do not send.

### 3.8 Approval log format

Create `arc-pipeline/04-approvals.md` at execution time. Each entry:

```text
CARD: A-02
STATUS: APPROVED
HUMAN: <name>
UTC: 2026-10-28T17:30:00Z
WALLET SHOWN ON DEVICE: <address>
TYPED CONFIRMATION: APPROVE A-02 5042
TX: 0x...
RECEIPT: status 1, block <n>
EXPLORER: https://explorer.arc.io/tx/0x...
NOTES: <none / deviation>
```

Do not write an entry before the transaction is signed and confirmed. A pre-filled approval log is not evidence.

---

## 4. Read-only post-deploy verification script

### 4.1 Location and purpose

**File:** `arc-pipeline/scripts/verify-mainnet-readonly.sh`

**Purpose:** verify a deployed ShiftProof contract using **RPC reads only**. It has no signing path, no wallet, no private-key flag, and no transaction broadcast. It checks:

1. Chain ID is `5042`.
2. Runtime code exists and is exactly **5,990 bytes**.
3. `usdc()` is the canonical USDC address.
4. `nextShiftId()` equals the expected value.
5. `totalEscrow()` equals the expected value.
6. USDC `decimals()` is `6`; `symbol()` is `USDC` (warn only if different).
7. The immutable caps are the expected values (informational).
8. Runtime Keccak-256 equals `0x843e…b1e5`.
9. The on-chain runtime matches the frozen artifact **byte-for-byte**, after patching the five 20-byte USDC immutable regions at offsets `395, 1474, 1932, 2394, 4141`.

Check 9 is stronger than the hash: it prints the exact differing offsets and bytes if anything is wrong.

### 4.2 Requirements

- `arc-cast` on `PATH`, or `CAST_BIN` set to the absolute path.
- `python3` (standard library only).
- The frozen artifact at `app/contracts/out/ShiftProof.sol/ShiftProof.json`.
- Network access to the Arc mainnet RPC.

### 4.3 Usage

```bash
chmod +x arc-pipeline/scripts/verify-mainnet-readonly.sh

# Immediately after deploy:
./arc-pipeline/scripts/verify-mainnet-readonly.sh "$SHIFTPROOF" 1 0

# After shifts A/B/C:
./arc-pipeline/scripts/verify-mainnet-readonly.sh "$SHIFTPROOF" 4 0

# After optional S0 + A/B/C:
./arc-pipeline/scripts/verify-mainnet-readonly.sh "$SHIFTPROOF" 5 0
```

Optional environment overrides:

```bash
ARC_MAINNET_RPC="https://rpc.mainnet.arc.io" \
CAST_BIN="$HOME/.local/bin/arc-cast" \
SHIFTPROOF_ARTIFACT="$PWD/app/contracts/out/ShiftProof.sol/ShiftProof.json" \
USDC_ADDRESS="0x3600000000000000000000000000000000000000" \
./arc-pipeline/scripts/verify-mainnet-readonly.sh "$SHIFTPROOF" 4 0
```

### 4.4 Expected output

A passing run looks like this (contract address elided):

```text
ShiftProof read-only verification
  RPC:      https://rpc.mainnet.arc.io
  Contract: 0x...
  USDC:     0x3600000000000000000000000000000000000000
  Artifact: /.../app/contracts/out/ShiftProof.sol/ShiftProof.json

PASS  chain ID is 5042 (Arc Mainnet)
PASS  runtime code size is 5990 bytes
PASS  usdc() is 0x3600000000000000000000000000000000000000
PASS  nextShiftId() is 1
PASS  totalEscrow() is 0 (6-decimal base units)
PASS  USDC decimals() is 6
PASS  USDC symbol() is USDC
INFO  MAX_HOURLY_RATE=1000000000 MAX_SHIFT_SECONDS=86400 MAX_ESCROW=10000000000
PASS  runtime keccak256 is 0x843ef44664f6eb7bbbe95c213d6fd60b88d912b3810d087981ab69a94b90b1e5
PASS  on-chain code matches the frozen artifact with USDC immutable bytes at [395, 1474, 1932, 2394, 4141]
PASS  exact bytecode comparison

RESULT: PASS - read-only checks passed. This does NOT verify source code on the explorer.
```

Exit code `0` means all checks passed; exit code `1` means one or more failed. The script prints `RESULT: FAIL` and tells the human not to fund/use the contract.

### 4.5 Test status

| Check | Status |
|---|---|
| Bash syntax (`bash -n`) | **VERIFIED** |
| Pass path with a mock `arc-cast` and the recorded testnet code | **VERIFIED** — all checks passed. |
| Failure path with a wrong `nextShiftId` | **VERIFIED** — exit 1. |
| Failure path with a one-byte runtime mutation | **VERIFIED** — exit 1; the exact comparison named offset 5,989. |
| Exact artifact/immutable comparison on the testnet code | **VERIFIED** — 0 diffs after patching. |
| Live mainnet RPC run | **UNVERIFIED** — no mainnet deployment. |
| Live mainnet `arc-cast` output parsing | **UNVERIFIED** — mock only. |

**Do not treat the mock test as a mainnet test.** The first real run must be after deployment, and the output must be saved under `arc-pipeline/04-evidence/mainnet/`.

### 4.6 Script limitations

- It cannot verify source code on the explorer; that is a separate step.
- It cannot prove the constructor was called with the right argument except through the immutable `usdc()` value and the bytecode comparison.
- It cannot prove the deployer was the intended human wallet; check the receipt and explorer.
- It cannot detect a blocklisted address or a future USDC freeze; those are runtime conditions.
- It hardcodes the expected runtime hash and immutable offsets. If the frozen artifact changes, update the script and this package in the same commit, then re-run the mock test.

## 5. 40 USDC mainnet demo runbook

### 5.1 Budget

**Cap on record:** **40 USDC total** for deployer wallet, escrows, and gas (`01-decision.md` amendment **2026-10-29 05:15 UTC**). **Execution: not authorized; each transaction needs per-card approval.** The 2026-10-29 amendment closes C4 and authorizes the cap; it does not authorize any individual mainnet deployment or transaction. The earlier Phase 1 §5 statement that the cap was “still proposed, not authorized for spend” is superseded at the cap level.

| Item | Amount (USDC) | Notes |
|---|---:|---|
| Deploy gas cap | 0.075 | 2,500,000 gas × 30 Gwei |
| A/B/C gas cap | 0.0750 | 16 transactions at the per-card caps |
| Buffer | 0.1000 | failed/replaced tx, rounding, fee variance |
| **Total gas cap** | **0.2500** | Covers deploy + A/B/C + buffer |
| Shift A escrow | 20.000000 | 4h × 5 USDC/h |
| Shift B escrow | 10.000000 | 2h × 5 USDC/h; 5 paid, 5 refunded |
| Shift C escrow | 5.000000 | 1h × 5 USDC/h; fully refunded |
| **Gross escrow A/B/C** | **35.000000** | Conservative commitment |
| **Total committed A/B/C** | **35.250000** | Gross escrow + gas cap |
| **Headroom under 40** | **4.750000** | Before any optional S0 |
| Optional S0 escrow | 1.000000 | 1h × 1 USDC/h |
| Optional S0 gas cap | 0.027000 | 6 transactions |
| **Total committed with S0** | **36.250000** | Uses the full 0.25 gas cap; S0 gas fits inside it; still under 40 |
| Expected employer net spend A/B/C | 25.000000 | A 20 + B 5; C refunded |
| Expected worker receive A/B/C | 25.000000 | A 20 + B 5; C refunded |
| Expected employer net spend with S0 | 26.000000 | S0 1 + A 20 + B 5 |
| Expected worker receive with S0 | 26.000000 | S0 1 + A 20 + B 5 |

**Worst case if B is attested for the full 2h instead of 1h:** B pays 10 instead of 5; total **net spend** becomes 30 (A 20 + B 10 + C 0), while gross escrow remains 35 and total committed remains 35.25. Still under 40. **Status: arithmetic `VERIFIED`; execution `UNVERIFIED`.**

**Gas cost formula used:** `gasLimit × 30 Gwei`, with 18-decimal native USDC. The protocol floor is 20 Gwei; 30 Gwei is the per-card cap. If the wallet prompt exceeds 30 Gwei, reject and stop. **Status: docs `VERIFIED`; mainnet gas estimate `UNVERIFIED`.**

### 5.2 Roles and funding

| Wallet | Role | Suggested funding | Covers | Status |
|---|---|---|---:|---|
| `⟨DEPLOYER⟩` | Deploy only | 0.50 USDC | Deploy gas 0.075 + buffer | `UNRESOLVED` — address/funding |
| `⟨EMPLOYER⟩` | Creates/attests/refunds/cancels | 35.50 USDC (36.50 with S0) | Escrow 35 (36) + gas | `UNRESOLVED` — address/funding |
| `⟨WORKER⟩` | Clocks/claims | 0.50 USDC | Gas for worker txs (6 in A/B/C; 9 with S0) | `UNRESOLVED` — address/funding |
| **Total** | | **36.50 USDC** (37.50 with S0) | Leaves 3.50 (2.50) under 40 | `UNRESOLVED` |

**Rules:**

- Employer and worker must be distinct addresses. `createShift` rejects `worker == employer`.
- The deployer should not also be the employer; keep roles separate for the demo and evidence.
- All three must be human-controlled. No agent keys, no shared seed, no Studio platform wallet.
- Gas and ERC-20 USDC share the same underlying balance on Arc. The funding amounts are conservative; exact post-gas balances are `UNVERIFIED`.
- Do not display native and ERC-20 USDC as two balances in the app. The docs explicitly warn against this.

### 5.3 Shifts

| Shift | Purpose | Worker | Hourly rate | Max seconds | Escrow | Attest | Owed | Refund | Final status |
|---|---|---|---:|---:|---:|---:|---:|---:|---|
| **A** | Happy path | `⟨WORKER⟩` | 5 USDC (`5000000`) | 14,400 (4h) | 20 USDC (`20000000`) | 14,400 (4h) | 20 USDC | 0 | `Settled` |
| **B** | Partial attestation + refund | `⟨WORKER⟩` | 5 USDC (`5000000`) | 7,200 (2h) | 10 USDC (`10000000`) | 3,600 (1h) | 5 USDC | 5 USDC | `Settled` |
| **C** | Cancel before clock-in | `⟨WORKER⟩` | 5 USDC (`5000000`) | 3,600 (1h) | 5 USDC (`5000000`) | none | 0 | 5 USDC | `Cancelled` |
| **S0** *(optional)* | Smoke test | `⟨WORKER⟩` | 1 USDC (`1000000`) | 3,600 (1h) | 1 USDC (`1000000`) | 3,600 (1h) | 1 USDC | 0 | `Settled` |

**Why these amounts:** A proves the full “paid at clock-out” path with a meaningful 20 USDC transfer; B proves partial work and residual refund without exceeding the cap; C proves employer cancel and full refund. The gross escrow is 35, leaving 5 nominal headroom under the 40 cap; 0.25 of that is the gas cap and 4.75 is the error buffer. S0 adds 1 and still leaves headroom.

### 5.4 Exact human-signed transaction order

**No batching. No automation. One signature per row. Wait for receipt status `1` before the next row.** The agent prepares and records; the human signs. **This table assumes no S0; if S0 is included, every A/B/C shift ID is +1.**

| # | Card | Signer | Function | Exact arguments | Amount | Recipient | Shift ID | Expected status / state |
|---:|---|---|---|---|---:|---|---:|---|
| 1 | **D-01** | Deployer | deploy `ShiftProof` | `usdc=0x3600…0000` | 0 | New contract | — | Code exists; `nextShiftId=1`; `totalEscrow=0` |
| 2 | **A-01** | Employer | `approve` on USDC | `spender=⟨SHIFTPROOF⟩`, `amount=20000000` | 20 | Spender only | — | Allowance `0→20` |
| 3 | **A-02** | Employer | `createShift` | `worker=⟨WORKER⟩`, `rate=5000000`, `maxSeconds=14400` | 20 | Escrow | 1 | `Funded`; `totalEscrow=20`; `nextShiftId=2` |
| 4 | **A-03** | Worker | `clockIn` | `shiftId=1` | 0 | None | 1 | `Active` |
| 5 | **A-04** | Worker | `clockOut` | `shiftId=1` | 0 | None | 1 | `AwaitingAttestation` |
| 6 | **A-05** | Employer | `attest` | `shiftId=1`, `seconds=14400` | 0 | None | 1 | `Attested`; `owed=20`; `escrow=20` |
| 7 | **A-06** | Worker | `claim` | `shiftId=1` | 20 | Worker | 1 | `Settled`; worker +20; contract −20; `totalEscrow=0` |
| 8 | **B-01** | Employer | `approve` on USDC | `spender=⟨SHIFTPROOF⟩`, `amount=10000000` | 10 | Spender only | — | Allowance `0→10` |
| 9 | **B-02** | Employer | `createShift` | `worker=⟨WORKER⟩`, `rate=5000000`, `maxSeconds=7200` | 10 | Escrow | 2 | `Funded`; `totalEscrow=10`; `nextShiftId=3` |
| 10 | **B-03** | Worker | `clockIn` | `shiftId=2` | 0 | None | 2 | `Active` |
| 11 | **B-04** | Worker | `clockOut` | `shiftId=2` | 0 | None | 2 | `AwaitingAttestation` |
| 12 | **B-05** | Employer | `attest` | `shiftId=2`, `seconds=3600` | 0 | None | 2 | `Attested`; `owed=5`; `escrow=10` |
| 13 | **B-06** | Employer (or any) | `refundUnused` | `shiftId=2` | 5 | Employer | 2 | Employer +5; `escrow=5`; `totalEscrow=5`; still `Attested` |
| 14 | **B-07** | Worker | `claim` | `shiftId=2` | 5 | Worker | 2 | `Settled`; worker +5; contract −5; `totalEscrow=0` |
| 15 | **C-01** | Employer | `approve` on USDC | `spender=⟨SHIFTPROOF⟩`, `amount=5000000` | 5 | Spender only | — | Allowance `0→5` |
| 16 | **C-02** | Employer | `createShift` | `worker=⟨WORKER⟩`, `rate=5000000`, `maxSeconds=3600` | 5 | Escrow | 3 | `Funded`; `totalEscrow=5`; `nextShiftId=4` |
| 17 | **C-03** | Employer | `cancel` | `shiftId=3` | 5 | Employer | 3 | `Cancelled`; employer +5; `totalEscrow=0` |

**Order notes:**

- A-01 must be mined before A-02; A-02 pulls the allowance.
- A-02 must be mined before A-03; the shift must exist and be `Funded`.
- A-03/A-04 are optional in the contract, but the demo shows the full clock-in/clock-out path; do not skip them.
- A-05 can be called from `Funded`, `Active`, or `AwaitingAttestation`, but the demo calls it after A-04.
- A-06 requires `Attested` and `owed > 0`.
- B-06 can be called before or after B-07, but the demo refunds first to show the residual refund separately. If B-07 is called first, B-06 still works while status is `Claimed`; the final state is the same.
- C-03 only works while shift 3 is `Funded`. Do not clock in first.
- If any transaction fails, stop. Do not “retry with a different amount” without a new approval card.

### 5.5 Exact send commands (human terminal only)

Set variables once:

```bash
export RPC="https://rpc.mainnet.arc.io"
export CHAIN="5042"
export USDC="0x3600000000000000000000000000000000000000"
export SHIFTPROOF="<SHIFTPROOF>"
export DEPLOYER="<DEPLOYER>"
export EMPLOYER="<EMPLOYER>"
export WORKER="<WORKER>"
```

**Deploy:** use §2.7. The remaining commands are `arc-cast send`; each is one signature.

**If the optional S0 smoke test is included:** every A/B/C shift ID below shifts by 1. Set `SHIFT_A=2`, `SHIFT_B=3`, `SHIFT_C=4` and replace the literal `1`/`2`/`3` in the `clockIn`, `clockOut`, `attest`, `claim`, `refundUnused`, and `cancel` commands. The final verifier expects `nextShiftId=5` with S0, or `4` without S0. The §5.4 order table also assumes no S0.

**Shift A:**

```bash
# A-01 approve 20 USDC
arc-cast send "$USDC" "approve(address,uint256)" "$SHIFTPROOF" 20000000 \
  --rpc-url "$RPC" --chain "$CHAIN" --from "$EMPLOYER" --ledger --gas-limit 100000

# A-02 create 4h x 5 USDC
arc-cast send "$SHIFTPROOF" "createShift(address,uint256,uint32)" "$WORKER" 5000000 14400 \
  --rpc-url "$RPC" --chain "$CHAIN" --from "$EMPLOYER" --ledger --gas-limit 300000

# A-03 clock in
arc-cast send "$SHIFTPROOF" "clockIn(uint256)" 1 \
  --rpc-url "$RPC" --chain "$CHAIN" --from "$WORKER" --ledger --gas-limit 100000

# A-04 clock out
arc-cast send "$SHIFTPROOF" "clockOut(uint256)" 1 \
  --rpc-url "$RPC" --chain "$CHAIN" --from "$WORKER" --ledger --gas-limit 100000

# A-05 attest 4h
arc-cast send "$SHIFTPROOF" "attest(uint256,uint32)" 1 14400 \
  --rpc-url "$RPC" --chain "$CHAIN" --from "$EMPLOYER" --ledger --gas-limit 150000

# A-06 claim 20 USDC
arc-cast send "$SHIFTPROOF" "claim(uint256)" 1 \
  --rpc-url "$RPC" --chain "$CHAIN" --from "$WORKER" --ledger --gas-limit 150000
```

**Shift B:**

```bash
# B-01 approve 10 USDC
arc-cast send "$USDC" "approve(address,uint256)" "$SHIFTPROOF" 10000000 \
  --rpc-url "$RPC" --chain "$CHAIN" --from "$EMPLOYER" --ledger --gas-limit 100000

# B-02 create 2h x 5 USDC
arc-cast send "$SHIFTPROOF" "createShift(address,uint256,uint32)" "$WORKER" 5000000 7200 \
  --rpc-url "$RPC" --chain "$CHAIN" --from "$EMPLOYER" --ledger --gas-limit 300000

# B-03 clock in
arc-cast send "$SHIFTPROOF" "clockIn(uint256)" 2 \
  --rpc-url "$RPC" --chain "$CHAIN" --from "$WORKER" --ledger --gas-limit 100000

# B-04 clock out
arc-cast send "$SHIFTPROOF" "clockOut(uint256)" 2 \
  --rpc-url "$RPC" --chain "$CHAIN" --from "$WORKER" --ledger --gas-limit 100000

# B-05 attest 1h
arc-cast send "$SHIFTPROOF" "attest(uint256,uint32)" 2 3600 \
  --rpc-url "$RPC" --chain "$CHAIN" --from "$EMPLOYER" --ledger --gas-limit 150000

# B-06 refund 5 USDC unused
arc-cast send "$SHIFTPROOF" "refundUnused(uint256)" 2 \
  --rpc-url "$RPC" --chain "$CHAIN" --from "$EMPLOYER" --ledger --gas-limit 150000

# B-07 claim 5 USDC
arc-cast send "$SHIFTPROOF" "claim(uint256)" 2 \
  --rpc-url "$RPC" --chain "$CHAIN" --from "$WORKER" --ledger --gas-limit 150000
```

**Shift C:**

```bash
# C-01 approve 5 USDC
arc-cast send "$USDC" "approve(address,uint256)" "$SHIFTPROOF" 5000000 \
  --rpc-url "$RPC" --chain "$CHAIN" --from "$EMPLOYER" --ledger --gas-limit 100000

# C-02 create 1h x 5 USDC
arc-cast send "$SHIFTPROOF" "createShift(address,uint256,uint32)" "$WORKER" 5000000 3600 \
  --rpc-url "$RPC" --chain "$CHAIN" --from "$EMPLOYER" --ledger --gas-limit 300000

# C-03 cancel before clock-in
arc-cast send "$SHIFTPROOF" "cancel(uint256)" 3 \
  --rpc-url "$RPC" --chain "$CHAIN" --from "$EMPLOYER" --ledger --gas-limit 150000
```

**If `--chain` is rejected by `arc-cast`, drop it and rely on the RPC + preflight chain check. Record the deviation.** If `--ledger` is unavailable, use `--account` with a human-controlled encrypted keystore, or move to Path B. **Never use `--private-key` in a command the agent can see.**

### 5.6 Per-card preflight and simulation

Before each card, the human runs the relevant reads. At minimum:

```bash
# Chain and contract identity
arc-cast chain-id --rpc-url "$RPC"
arc-cast code "$SHIFTPROOF" --rpc-url "$RPC" | cut -c1-20
# Non-empty is the quick check; exact 5,990-byte size is checked by §4.
arc-cast call "$SHIFTPROOF" "usdc()(address)" --rpc-url "$RPC"
arc-cast call "$SHIFTPROOF" "nextShiftId()(uint256)" --rpc-url "$RPC"
arc-cast call "$SHIFTPROOF" "totalEscrow()(uint256)" --rpc-url "$RPC"

# USDC identity and balances
arc-cast call "$USDC" "decimals()(uint8)" --rpc-url "$RPC"
arc-cast call "$USDC" "balanceOf(address)(uint256)" "$EMPLOYER" --rpc-url "$RPC"
arc-cast call "$USDC" "balanceOf(address)(uint256)" "$WORKER" --rpc-url "$RPC"
arc-cast call "$USDC" "balanceOf(address)(uint256)" "$SHIFTPROOF" --rpc-url "$RPC"
arc-cast call "$USDC" "allowance(address,address)(uint256)" "$EMPLOYER" "$SHIFTPROOF" --rpc-url "$RPC"
```

Then simulate the exact call with `arc-cast call ... --from ⟨role⟩`. Examples:

```bash
# Simulate A-02
arc-cast call "$SHIFTPROOF" "createShift(address,uint256,uint32)" "$WORKER" 5000000 14400 \
  --from "$EMPLOYER" --rpc-url "$RPC"

# Simulate A-05
arc-cast call "$SHIFTPROOF" "attest(uint256,uint32)" 1 14400 \
  --from "$EMPLOYER" --rpc-url "$RPC"

# Simulate A-06
arc-cast call "$SHIFTPROOF" "claim(uint256)" 1 \
  --from "$WORKER" --rpc-url "$RPC"
```

**Simulation is not a guarantee.** It executes against current state without mining. The wallet prompt and the mined receipt are the authoritative checks.

### 5.7 Expected state ledger (A/B/C, excluding gas)

Token balances below are **ERC-20 USDC, before gas**. Gas is paid from the same underlying USDC balance; exact post-gas balances are `UNVERIFIED`. The escrow/status/ID deltas are exact.

| Checkpoint | Employer | Worker | Contract | `totalEscrow` | `nextShiftId` | Shift status |
|---|---:|---:|---:|---:|---:|---|
| After funding | 35.500000 | 0.500000 | 0 | 0 | 1 | — |
| After A-02 | 15.500000 | 0.500000 | 20.000000 | 20.000000 | 2 | 1 `Funded` |
| After A-06 | 15.500000 | 20.500000 | 0 | 0 | 2 | 1 `Settled` |
| After B-02 | 5.500000 | 20.500000 | 10.000000 | 10.000000 | 3 | 2 `Funded` |
| After B-06 | 10.500000 | 20.500000 | 5.000000 | 5.000000 | 3 | 2 `Attested` (escrow 5, owed 5) |
| After B-07 | 10.500000 | 25.500000 | 0 | 0 | 3 | 2 `Settled` |
| After C-02 | 5.500000 | 25.500000 | 5.000000 | 5.000000 | 4 | 3 `Funded` |
| After C-03 | 10.500000 | 25.500000 | 0 | 0 | 4 | 3 `Cancelled` |

**Final A/B/C:** employer `10.500000`, worker `25.500000`, contract `0`, `totalEscrow=0`, `nextShiftId=4`; shifts 1 and 2 `Settled`, shift 3 `Cancelled`. **Status: exact token deltas `VERIFIED` by arithmetic; post-gas balances `UNVERIFIED`.**

**With S0 first:** start employer `36.500000`, worker `0.500000`; after S0 claim employer `35.500000`, worker `1.500000`; then A/B/C shift IDs become 2/3/4. Final employer `10.500000`, worker `26.500000`, `nextShiftId=5`; S0/A/B `Settled`, C `Cancelled`.

### 5.8 UI sequence for the demo/video

The app must first be mainnet-configured; see §5.11. Until then, this sequence is **`UNVERIFIED`**. In this section, `⟨HOST_URL⟩` means the mainnet-configured production URL, **not** the current testnet-only Vercel preview.

1. Open `⟨HOST_URL⟩` in a clean browser profile. Confirm the network badge says **Arc Mainnet (5042)** and the contract matches `⟨SHIFTPROOF⟩`.
2. `/employer` — connect employer wallet. Create A:
   - Approve **20.000000 USDC** (exact; wallet prompt shows the spender).
   - Create shift: worker `⟨WORKER⟩`, rate `5 USDC/h`, max `4h`.
   - Confirm the receipt card shows shift 1 `Funded`, escrow 20.
3. `/worker` — connect worker wallet. Clock in A, wait, clock out A. Show `Active` then `Awaiting Attestation`.
4. `/employer` — attest A `4h` (14,400 seconds). Show `Attested`, owed 20.
5. `/worker` — claim A. Show the 20 USDC transfer and `Settled`.
6. `/employer` — B: approve 10, create 2h × 5. Worker clocks in/out; employer attests `1h` (3,600). Employer calls `refundUnused` (5 USDC back); worker claims 5. Show `Settled`.
7. `/employer` — C: approve 5, create 1h × 5; cancel before clock-in. Show `Cancelled` and 5 USDC refund.
8. `/shift/1`, `/shift/2`, `/shift/3` — show public receipts. `/proof` — show host/repo/video/contract links and the honest verification status.
9. Explorer — show the A claim tx (`https://explorer.arc.io/tx/⟨TX_A_CLAIM⟩`), the USDC `Transfer` log to the worker, and the contract page.

**Do not stage fake screens.** If the app cannot show a mainnet state, do not record the video yet. The video requirement is a real mainnet transaction, not a mock.

### 5.9 Stop conditions

Stop immediately if any of these occur:

- `arc-cast chain-id` is not `5042`.
- Runtime code is missing, length ≠ `5,990`, or hash ≠ `0x843e…b1e5`.
- `usdc()` ≠ `0x3600…0000`, or `decimals()` ≠ `6`.
- Any wallet balance is below the card amount + gas cap.
- Allowance is not the exact expected value before `approve`/`create`.
- Simulation reverts for an unexpected reason.
- The wallet prompt shows a different chain, contract, function, amount, recipient, gas limit, or max fee > `30 Gwei`.
- Receipt status is not `1`.
- The total committed would exceed **40 USDC**.
- A USDC blocklist revert occurs; gas is consumed and there is no rescue path.
- The app shows the wrong chain/contract, or still shows testnet facts.
- Explorer code/address differs from the recorded deployment.
- Any source-verification claim appears without an explorer-verified contract.
- Any key/seed appears on screen, in the repo, or in a shell command.

### 5.10 Optional S0 smoke test

Recommended before A/B/C, with separate approval. The table below is a summary; fill the §3.2 card template for each S0 transaction, including gas caps and abort conditions.

| Card | Signer | Function | Amount | Expected |
|---|---|---|---:|---|
| S0-01 | Employer | `approve(ShiftProof, 1000000)` | 1 | Allowance `0→1` |
| S0-02 | Employer | `createShift(worker, 1000000, 3600)` | 1 | Shift 1 `Funded`; `nextShiftId=2`; `totalEscrow=1` |
| S0-03 | Worker | `clockIn(1)` | 0 | `Active` |
| S0-04 | Worker | `clockOut(1)` | 0 | `AwaitingAttestation` |
| S0-05 | Employer | `attest(1, 3600)` | 0 | `Attested`; owed 1 |
| S0-06 | Worker | `claim(1)` | 1 | `Settled`; worker +1; `totalEscrow=0` |

Then A/B/C shift IDs are 2/3/4 and final `nextShiftId=5`. Total with S0 is 36.25 USDC committed, still under 40.

### 5.11 App mainnet prerequisites (Phase 2b, not done)

**The current app runtime and UI are testnet-only.** Verified in:

- `app/deployments.json` — only `ShiftProof.arcTestnet`.
- `app/src/lib/contract.ts` — `CHAIN_ID = 5042002`, testnet RPC/explorer, testnet address.
- `app/src/config.ts` — `chains: [arcTestnet, mainnet]`; no Arc mainnet chain.
- `app/src/pages/Proof.tsx` — testnet facts and “this page — hosted via Arc Studio preview.”
- `app/src/pages/Help.tsx` — testnet RPC/explorer and “Is this on mainnet? No.”
- `app/src/components/Layout.tsx` — footer says “testnet only.”
- `app/src/pages/Home.tsx` — hero says “Arc Testnet.”
- `app/src/components/ShiftCard.tsx` — hardcoded `https://explorer.testnet.arc.io` links.
- `app/src/pages/ShiftReceipt.tsx` — hardcoded `https://explorer.testnet.arc.io` links.
- `app/README.md` — testnet deployment table and localhost instructions.
- `app/AGENTS.md` — testnet deployment and explorer link.
- `app/TESTNET-E2E.md` — Arc Testnet fork/RPC/faucet instructions and links.
- `app/TESTNET-E2E-LIVE.md` — live two-wallet testnet checklist; expected results and screenshot points.
- `app/src/onchain-facts.ts` — already contains Arc mainnet chain `5042`; generated, so confirm it is current rather than assuming it is testnet-only.

**Required changes before any mainnet video:**

| File | Change | Status |
|---|---|---|
| `app/deployments.json` | Add an `arcMainnet` entry with the real address/tx/block; keep `verified:false` until explorer verification. | `UNVERIFIED` |
| `app/src/lib/contract.ts` | Read the mainnet entry; set `CHAIN_ID=5042`, `CHAIN_NAME='Arc'`, `CHAIN_RPC='https://rpc.mainnet.arc.io'`, `EXPLORER_BASE='https://explorer.arc.io'`. | `UNVERIFIED` |
| `app/src/config.ts` | Import `arc` from `viem/chains` (documented built-in), add `http('https://rpc.mainnet.arc.io')`, keep `mainnet` for ENS. | `UNVERIFIED` |
| `app/src/pages/Proof.tsx` | Replace testnet facts with mainnet facts; replace the Studio-preview app URL with `window.location.origin` and label it as the hosted app; correct the test provenance and bytecode wording. The prepared Studio prompt covers this; it has not been run. | `UNVERIFIED` — prompt prepared, not run |
| `app/src/pages/Help.tsx` | Update network setup, USDC faucet FAQ, hardcoded testnet RPC/explorer URLs, and “Is this on mainnet?”; keep the disclosed-demo and no-dispute language. | `UNVERIFIED` |
| `app/src/components/Layout.tsx` | Remove “testnet only”; use `CHAIN_NAME` / `CHAIN_ID`. | `UNVERIFIED` |
| `app/src/pages/Home.tsx` | Replace “Arc Testnet” with `CHAIN_NAME`; update the hero copy. | `UNVERIFIED` |
| `app/src/components/ShiftCard.tsx` | Replace hardcoded `explorer.testnet.arc.io` links with `explorerTx` / `explorerAddr` / `EXPLORER_BASE`. | `UNVERIFIED` |
| `app/src/pages/ShiftReceipt.tsx` | Replace hardcoded `explorer.testnet.arc.io` links with the shared explorer helpers. | `UNVERIFIED` |
| `app/src/onchain-facts.ts` | Verify the generated file still contains the Arc mainnet `5042` facts; do not hand-edit generated data. | `VERIFIED` current; `UNVERIFIED` after regeneration |
| `app/package.json` | Add a real `build` script (`vite build`) or use `bunx vite build`; current scripts have `check` but no `build`. | `VERIFIED` doc fix; script optional |
| `app/package.json` | `contracts:build`/`contracts:test` call `forge`, not `arc-forge`; document or change for Arc Foundry. | `UNVERIFIED` — minor |
| `app/README.md` | Use the §6 draft; add the build/deploy/evidence links. The published copy now uses `bunx vite build` and corrects the invariant count. | `VERIFIED` doc fix |
| `arc-pipeline/04-approvals.md` | Create at execution; no pre-filled approvals. | `UNVERIFIED` |
| `arc-pipeline/04-evidence/mainnet/` | Create at execution; receipts, reads, screenshots, failed tx records. | `UNVERIFIED` |

**Known copy defects to fix before the video:**

1. `Proof.tsx` says “76/76 Foundry unit/fuzz/invariant tests pass — Confirmed locally with forge test.” Phase 1 says local Foundry was not installed; Studio was the test authority. Change to “Studio test run; raw log at `03-evidence/s2-forge-test.log`.” **Status: `UNRESOLVED` — factual copy defect.**
2. `Proof.tsx` labels “ABI match between artifact and deployed bytecode” as false. The runtime bytecode actually matches the artifact except the five immutable bytes; ABI is not bytecode. Replace with two separate lines: “runtime bytecode matches artifact except immutables” (`VERIFIED` on testnet) and “source verified on explorer” (`UNVERIFIED`). **Status: `UNRESOLVED` — copy defect.**
3. `Proof.tsx` calls the Studio preview the public app URL in two places (Deployment InfoRow and Links). Studio does not host public apps. A Vercel preview is now live, but the page has not been wired to it. The prepared Studio prompt replaces both with `window.location.origin` and labels the result as the hosted app. **Status: `UNRESOLVED` — prompt prepared, not run.**
4. `Help.tsx` hardcodes testnet RPC/explorer/faucet details and says “No. ShiftProof V1 is deployed on Arc Testnet only.” Update only after a real mainnet deploy; do not pre-claim mainnet. **Status: `UNVERIFIED`.**
5. `03-phase1-report.md` §1 and `02-architecture-spec.md` §15.5 say the deploy script checks deployer gas balance. It does not. Correct the docs or add the external check to the runbook. **Status: `UNRESOLVED` — documentation/code discrepancy.**
6. `Layout.tsx` footer says “testnet only”; `Home.tsx` hero says “Arc Testnet”; `ShiftCard.tsx` and `ShiftReceipt.tsx` hardcode `explorer.testnet.arc.io`. These are visible in the video. Fix before recording. **Status: `UNRESOLVED`.**
7. `Home.tsx` says “USDC held until work is verified and claimed.” The contract uses employer attestation, not trustless verification. Change “verified” to “attested” or “approved by the employer.” **Status: `UNRESOLVED` — copy defect.**

## 6. README draft

The block below is copy-ready for the public repository root. Replace every `⟨…⟩` placeholder before publishing. Keep the disclosure at the top. The labels are intentional; do not strip them to make the project look more finished than it is.

````markdown

# ShiftProof

> **Disclosed demonstration — not a live payroll service.**  
> ShiftProof is a per-shift USDC escrow demo built with Arc Studio [E19]. Both the employer and worker wallets are controlled by the builder [E24 §0.2]. No real worker pilot, letter of intent, legal review, or production payroll use is claimed [E24 §0.2]. The contract pays on **employer attestation**, not trustless verification of work [E18]. There are no worker fees [E18]. Do not use this with real workers until a jurisdiction/legal review and a written pilot agreement exist.

**Status:** Phase 2b. The contract is frozen and tested on Arc Testnet [E03, E04]. **No Arc mainnet deployment, transaction, or key access has been made** [E02 §8]. C4 is closed and the 40 USDC cap is authorized; Path B (Remix + Rabby) is primary; every mainnet transaction still needs separate approval [E24 §0]. Public repo and Vercel preview are live; the preview is testnet-only. `VERIFIED` for the testnet facts below; `UNVERIFIED` for mainnet.

**Labels:** `VERIFIED` = directly observed in the linked evidence; `UNVERIFIED` = prepared/inferred but not exercised on mainnet; `UNRESOLVED` = a human decision, external dependency, or open contradiction.

The full claim-to-evidence register is [E24 §8]; unresolved reproducibility gaps are in [E24 §9]. Each factual claim below is either cited inline or mapped there.

## Proof at a glance

| Asset | Value | Status |
|---|---|---|
| Hosted app | [shiftproof-e51a9julz-oxunify.vercel.app](https://shiftproof-e51a9julz-oxunify.vercel.app) | `VERIFIED` testnet-only preview |
| Public repo | [github.com/unifyWeb3/shiftproof](https://github.com/unifyWeb3/shiftproof) | `VERIFIED` |
| Demo video | `⟨VIDEO_URL⟩` | `UNRESOLVED` |
| Arc Studio project | [studio.arc.io/app/35650d11-57a8-4743-8c23-a6bfe1a02f39](https://studio.arc.io/app/35650d11-57a8-4743-8c23-a6bfe1a02f39) | `VERIFIED` URL exists; public access `UNRESOLVED` |
| Builder profile | [x.com/oxunify](https://x.com/oxunify) | `VERIFIED` URL provided; ownership `UNVERIFIED` |
| Arc mainnet contract | `⟨MAINNET_CONTRACT⟩` | `UNVERIFIED` — not deployed |
| Arc mainnet deploy tx | `⟨MAINNET_DEPLOY_TX⟩` | `UNVERIFIED` — not deployed |
| Source verification | `⟨VERIFICATION_URL⟩` | `UNRESOLVED` |
| Proof page | [shiftproof-e51a9julz-oxunify.vercel.app/proof](https://shiftproof-e51a9julz-oxunify.vercel.app/proof) | `VERIFIED` testnet-only preview |
| Mainnet demo txs | `⟨MAINNET_DEMO_TXS⟩` | `UNVERIFIED` — not run |
| Arc testnet contract | [`0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6`](https://explorer.testnet.arc.io/address/0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6) | `VERIFIED` |
| Arc testnet deploy tx | [`0x89b616d…dcfd52`](https://explorer.testnet.arc.io/tx/0x89b616d394bd6b834901e24d3651fd05bdcbe4d84dae64befeb5fc5f40dcfd52) | `VERIFIED` |
| Contract tests | 76/76 Studio run; 6 invariants at 256 runs × 128,000 calls | `VERIFIED` [E03] |
| Live-USDC E2E on testnet | Not run with two live wallets | `UNVERIFIED` [E02 §3] |
| Mainnet demo shifts | A/B/C not run | `UNVERIFIED` [E24 §5] |

## What it is

ShiftProof is a narrow primitive for hourly/1099-style work:

1. An employer pre-funds a shift in USDC.
2. The worker optionally clocks in and out.
3. The employer attests the number of seconds to pay.
4. The worker claims the earned USDC.
5. Any unused escrow can be refunded to the employer with a separate `refundUnused` call.
6. The employer can cancel before the worker clocks in.

The contract is one immutable, keyless deployment. It has no owner, admin, pause, proxy, upgrade, fee, sweep, or native-value path. `VERIFIED` [E02 §1, §4; E18].

| Fact | Value | Status |
|---|---|---|
| Source | `contracts/ShiftProof.sol:ShiftProof` | `VERIFIED` [E18] |
| Source Keccak-256 | `0x5d5e2edb0e2cea4601933f12b2a59bd4e0424d07375323404e0df5c2813ae3ca` | `VERIFIED` [E06] |
| Compiler | `solc 0.8.28+commit.7893614a` | `VERIFIED` [E06] |
| EVM target | `cancun` | `VERIFIED` [E06, E07] |
| Optimizer | enabled, 200 runs | `VERIFIED` [E06, E07] |
| `viaIR` | false / unset | `VERIFIED` [E06] |
| Metadata bytecode hash | `ipfs` | `VERIFIED` [E06] |
| OpenZeppelin | `5.6.1` | `VERIFIED` [E08] |
| USDC (ERC-20 interface) | `0x3600000000000000000000000000000000000000`, 6 decimals | `VERIFIED` [E09] |
| Native gas | USDC, 18 decimals; same underlying balance | `VERIFIED` [E09, E11] |
| Expected mainnet runtime | 5,990 bytes, `0x843ef44664f6eb7bbbe95c213d6fd60b88d912b3810d087981ab69a94b90b1e5` | `VERIFIED` reconstruction; `UNVERIFIED` on mainnet [E23] |
| Testnet runtime | 5,990 bytes, same hash | `VERIFIED` [E04, E23] |

## What it is not

- **Not live payroll or earned-wage access.** It is a disclosed demonstration. No real employer/worker pilot is claimed. `VERIFIED` [E24 §0.2]
- **Not trustless work verification.** The employer’s attestation is the trust anchor. The contract cannot prove the worker actually worked. `VERIFIED` [E18; app Help/Proof]
- **Not audited.** No security audit has been performed. Do not claim one. `VERIFIED` [E02 §3]
- **Not a dispute system.** There is no arbitration, escrow agent, or onchain dispute path. Disagreements must be resolved off-chain before attestation. `VERIFIED` [E18]
- **Not a fee product.** There is no protocol fee, admin cut, or token. Workers pay no fee; gas is paid by the transacting wallet. `VERIFIED` [E18]
- **Not mainnet yet.** The testnet deployment is not mainnet proof. `VERIFIED` [E02 §8]
- **Not source-verified on the explorer.** Testnet verification returned bytecode only. Do not call it verified until the explorer shows the source/ABI. `VERIFIED` for testnet status; `UNRESOLVED` for mainnet [E15]

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

`cancel` is only allowed while `Funded` (before clock-in). `refundUnused` is permissionless but always pays the employer. `claim` does **not** automatically refund unused escrow; that is a separate call. `VERIFIED` [E18; app Help].

Escrow is computed as `hourlyRate × maxSeconds / 3600`, in 6-decimal USDC. Caps: `MAX_HOURLY_RATE=1,000 USDC`, `MAX_SHIFT_SECONDS=24h`, `MAX_ESCROW=10,000 USDC`. `VERIFIED` [E18].

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
- **Frontend:** `bun run check` passed (0 lint warnings/errors; `tsc --noEmit` exit 0); `bunx vite build` succeeded (chunk-size notices are informational). `VERIFIED` [E16].
- **Live-USDC testnet E2E with two real wallets:** not run. `UNVERIFIED` [E02 §3].
- **Source verification:** explorer API returned bytecode only, no source/ABI; `verified:false`. `VERIFIED` for the failed attempt; do not call it verified [E15].
- **Mainnet:** no deployment, transaction, key access, or spend. `VERIFIED` [E02 §8].

## Security and trust model

- **No privileged path:** no owner, admin, pause, proxy, upgrade, fee, sweep, rescue, or native-value function. The deployer has no post-deploy privilege. `VERIFIED` [E18; E02 §4].
- **USDC handling:** `SafeERC20`; exact approvals in the UI; state-before-transfer for claim/refund/cancel; `ReentrancyGuard` on the USDC-transfer paths (`createShift`, `claim`, `refundUnused`, `cancel`); `clockIn`/`clockOut`/`attest` have no external calls; no arbitrary token or recipient. `VERIFIED` [E18].
- **One inbound transfer exception:** `createShift` does the inbound `safeTransferFrom` before the state write, documented in the source. This is not an arbitrary external call. `VERIFIED` [E18].
- **Trust anchor:** employer attestation, not proof of work. No dispute path. `VERIFIED` [E18].
- **Privacy:** only public addresses, shift IDs, amounts, timestamps, and tx hashes onchain. No names, emails, locations, tax IDs, or documents. localStorage is a cache, not a source of truth. `VERIFIED` [E02 §4; app Help].
- **Arc-specific risks:** USDC blocklist reverts consume gas; native USDC is 18 decimals while the ERC-20 interface is 6; the 20 Gwei floor can drop underpriced transactions. `VERIFIED` [E11, E12].
- **No audit:** do not claim one. `VERIFIED` [E02 §3].

## Repository layout

```text
app/
  contracts/ShiftProof.sol          # frozen contract
  contracts/test/                   # Foundry tests
  contracts/script/Deploy.s.sol     # deploy preflight + deployment
  contracts/out/                    # frozen artifact
  src/                              # Vite + React + wagmi app
  deployments.json                  # testnet now; mainnet pending
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

The script checks chain `5042`, code size 5,990, `usdc()`, `nextShiftId`, `totalEscrow`, USDC decimals, the runtime hash, and the exact artifact comparison with the five immutable USDC bytes patched. `VERIFIED` by mock test; `UNVERIFIED` on mainnet [E24 §4].

**Source verification:** try `arc-forge verify-contract` with the Blockscout verifier and `https://explorer.arc.io/api/`, then the explorer UI. If it fails, publish the source/settings/constructor arg/hashes and say **“source published; explorer verification pending.”** Never say verified without the explorer. `UNRESOLVED` [E15, E24 §2.10].

## Demo (40 USDC cap)

The demo uses three shifts, with both wallets builder-controlled:

| Shift | Escrow | Attest | Paid | Refunded | Final |
|---|---:|---:|---:|---:|---|
| A: 4h × 5 USDC | 20 USDC | 4h | 20 USDC | 0 | `Settled` |
| B: 2h × 5 USDC | 10 USDC | 1h | 5 USDC | 5 USDC | `Settled` |
| C: 1h × 5 USDC | 5 USDC | none | 0 | 5 USDC | `Cancelled` |

Gross escrow 35 USDC; gas cap 0.25 USDC; total committed 35.25 USDC, under the 40 USDC cap. Optional 1 USDC smoke test raises it to 36.25 USDC. `VERIFIED` arithmetic; `UNVERIFIED` execution. The 40 USDC cap is authorized; **no mainnet transaction is authorized without per-card approval** [E24 §5.1].

## Limitations and open items

- No real worker pilot, LOI, or legal review. `UNRESOLVED (waived, not satisfied)` [E24 §0.2].
- Employer attestation is centralized trust. `VERIFIED` [E18].
- No dispute mechanism. `VERIFIED` [E18].
- No live-USDC testnet E2E with two real wallets. `UNVERIFIED` [E02 §3].
- No explorer source verification. `UNRESOLVED` [E15].
- No mainnet deployment. `VERIFIED` [E02 §8].
- Public repo and Vercel preview authorized; video is still a placeholder. `UNRESOLVED` [E24 §0, §6].
- The app’s runtime/UI is testnet-only until Phase 2b updates `deployments.json`, `contract.ts`, `config.ts`, `Proof.tsx`, `Help.tsx`, `Layout.tsx`, `Home.tsx`, `ShiftCard.tsx`, and `ShiftReceipt.tsx` (full list: [E24 §5.11]). `VERIFIED` current state; `UNVERIFIED` mainnet config.
- No `bun.lock`; forge-std commit not pinned; Arc Foundry version not recorded in the artifact. `UNRESOLVED` reproducibility gaps [E24 §9 #12].
- No audit. Do not imply one. `VERIFIED` [E02 §3].

## Testnet-only UI references (Phase 2b backlog)

The app preview is **testnet-only**. These files contain testnet facts or links and must be updated before any mainnet recording. `VERIFIED` current state; `UNVERIFIED` mainnet config [E24 §5.11].

| File | Testnet-only reference |
|---|---|
| `app/deployments.json` | Only `ShiftProof.arcTestnet`; testnet explorer URL. |
| `app/src/lib/contract.ts` | `CHAIN_ID = 5042002`; testnet RPC/explorer; testnet contract address. |
| `app/src/config.ts` | `chains: [arcTestnet, mainnet]`; no Arc mainnet chain. |
| `app/src/pages/Proof.tsx` | “Contract deployed to Arc Testnet”; testnet E2E status; Studio-preview app URL. |
| `app/src/pages/Help.tsx` | Testnet RPC/explorer/faucet copy; “Is this on mainnet? No.” |
| `app/src/components/Layout.tsx` | Footer says “testnet only.” |
| `app/src/pages/Home.tsx` | Hero says “Arc Testnet”; “verified” copy should say “attested.” |
| `app/src/components/ShiftCard.tsx` | Hardcoded `https://explorer.testnet.arc.io` tx/address links. |
| `app/src/pages/ShiftReceipt.tsx` | Hardcoded `https://explorer.testnet.arc.io` address links. |
| `app/README.md` | Testnet deployment table, testnet connection instructions; build command is `bunx vite build`. |
| `app/AGENTS.md` | Testnet deployment/explorer link. |
| `app/TESTNET-E2E.md` | Arc Testnet fork/RPC/faucet instructions and links. |
| `app/TESTNET-E2E-LIVE.md` | Live two-wallet testnet checklist; expected results and screenshot points. |
| `app/src/onchain-facts.ts` | Contains **both** testnet and mainnet facts; generated file, not testnet-only. Verify current before use. |

## License

The contract source is SPDX `MIT`. The public repository now contains a top-level MIT `LICENSE` file. `VERIFIED`.

````

**Publishing note:** The README’s `E##` links are relative to the repo root, so publish `arc-pipeline/` with the repo (or replace them with public permalinks) or the evidence links will 404. Replace every `⟨…⟩` placeholder first.

## 7. Video script (2:40 target)

**Status:** `UNVERIFIED` — not recorded. Every claim below must be true at the moment of recording. If a mainnet transaction is not on `explorer.arc.io`, do not say it is.

**Format:** 1080p, 16:9 screen recording + voiceover; burned-in captions; no background music that obscures narration. Keep the final cut between **2:30 and 2:55**.

| Time | Visual | Audio (narration) | On-screen text | Claim label / evidence |
|---|---|---|---|---|
| 0:00–0:10 | Cold open: `https://explorer.arc.io/tx/⟨TX_A_CLAIM⟩` showing success and the USDC `Transfer` to the worker. | “This is ShiftProof: a per-shift USDC escrow on Arc. The demo worker wallet just claimed 20 USDC on mainnet. Here is the transaction.” | **20 USDC claimed on Arc mainnet** | `VERIFIED` only if the explorer shows it at recording; otherwise cut this open and do not make the claim. |
| 0:10–0:30 | Arc Studio workspace: project URL, chat, `contracts/ShiftProof.sol`, test output. | “It was built in Arc Studio. Here is the project, the contract, and the 76-out-of-76 test run.” | **Built with Arc Studio**; **76/76 tests** | `VERIFIED` — [E19], [E03]. |
| 0:30–0:45 | Live app `⟨HOST_URL⟩` `/employer`; network badge **Arc Mainnet 5042**; contract `⟨SHIFTPROOF⟩`. | “The app is on Arc mainnet, chain 5042. The contract address is pinned in the build.” | **Arc Mainnet · 5042**; `⟨SHIFTPROOF⟩` | `VERIFIED` at recording if the app shows it; otherwise `UNVERIFIED`. |
| 0:45–1:00 | Employer approves exactly 20 USDC; wallet prompt shows the spender; then `createShift` for 4h × 5 USDC. | “The employer approves exactly 20 USDC, then creates a four-hour shift at five USDC per hour. Twenty USDC is now escrowed.” | **Approve 20.000000 USDC**; **Escrow 20.000000 USDC** | `VERIFIED` if the two mainnet txs are shown; tie to `⟨TX_A_APPROVE⟩` and `⟨TX_A_CREATE⟩`. |
| 1:00–1:15 | Worker `/worker` clocks in and out; status changes `Active` → `Awaiting Attestation`. | “The worker clocks in and out. The timestamps are onchain, but they are audit data — not proof of work.” | **Clock in / clock out**; **Employer attestation is the trust anchor** | `VERIFIED` — source/UI; honest trust framing. |
| 1:15–1:30 | Employer attests 4 hours (14,400 seconds); worker claims 20 USDC; receipt shows `Settled`. | “The employer attests four hours. The worker claims 20 USDC. The shift settles in one claim transaction.” | **Attest 4h**; **Claim 20 USDC**; **Settled** | `VERIFIED` if `⟨TX_A_CLAIM⟩` shows it; otherwise `UNVERIFIED`. |
| 1:30–1:50 | Fast but honest montage: B approve 10, create 2h × 5, clock in/out, attest 1h, refund 5, claim 5; C approve 5, create 1h × 5, cancel. | “B shows partial work: ten escrowed, one hour attested, five refunded, five claimed. C cancels before clock-in and refunds all five.” | **B: 10 → 5 paid + 5 refunded**; **C: 5 refunded** | `VERIFIED` only if the corresponding mainnet txs are shown; otherwise label as planned/`UNVERIFIED`. |
| 1:50–2:10 | Explorer: `⟨TX_A_CLAIM⟩` logs; contract page `⟨SHIFTPROOF⟩`; code tab. | “Every step is a real mainnet transaction. Here is the claim: status success, 20 USDC transferred to the worker. The contract is immutable and keyless.” | **Status: success**; **Transfer 20 USDC → worker**; **No admin, no pause, no upgrade, no fees** | `VERIFIED` at recording; source/ABI for keyless claims [E18]. |
| 2:10–2:25 | `/proof` page and `README.md` top disclosure; source-verification status. | “Disclosure: both wallets are builder-controlled. There is no real worker pilot, no legal review, and no audit. Source verification is shown honestly — if it is pending, the page says pending.” | **Builder-controlled demo**; **No real pilot / no legal review / no audit**; **Source verification: ⟨status⟩** | `VERIFIED` — [E01 §5.1], [E02 §3], [E15]. Do not say “verified” unless the explorer shows it. |
| 2:25–2:40 | Close on `/` and the repo link; end card with contract, Studio, repo, video. | “ShiftProof: fund a shift, attest the hours, pay in USDC. Built with Arc Studio.” | **⟨HOST_URL⟩**; **github.com/unifyWeb3/shiftproof**; **⟨SHIFTPROOF⟩** | `VERIFIED` for links at recording; otherwise `UNRESOLVED`. |

### 7.1 Studio workspace shot

Show, in one continuous screen:

1. The Studio project URL `https://studio.arc.io/app/35650d11-57a8-4743-8c23-a6bfe1a02f39`.
2. The project name `ShiftProof`.
3. The contract file `contracts/ShiftProof.sol`.
4. The test run summary `76 tests passed` and the invariant block.
5. The deployment record or contract address.

Do not show API keys, Studio tokens, environment files, browser autofill, email, or any seed/private key. Wallet addresses are public; still avoid showing unrelated accounts.

### 7.2 Live app shot

- Use a clean browser profile and the hosted app, not a local mock.
- The network badge must say **Arc Mainnet (5042)**.
- The contract address on `/proof` must equal `⟨SHIFTPROOF⟩`.
- Show at least one full wallet prompt for the 20 USDC approval and one for the claim. The prompt should show the spender/contract and the exact amount. Do not show a seed phrase or “reveal private key.”
- If the app still shows testnet facts, **do not record**. Fix §5.11 first.
- If the app cannot show a receipt, use the explorer as the authoritative receipt, but do not fake the app state.

### 7.3 Explorer shot

- Use `https://explorer.arc.io/tx/⟨TX_A_CLAIM⟩`.
- Show status `Success`, block number, timestamp, from/to, and the USDC `Transfer` log to the worker.
- Show `https://explorer.arc.io/address/⟨SHIFTPROOF⟩` and the code tab.
- If source verification is pending, say “source published; explorer verification pending.” Do not show a “verified” badge that is not there.
- Do not use the testnet explorer for mainnet claims.

### 7.4 Do not say

- “Audited” — no audit exists.
- “Trustless” or “verified work” — the employer attests; that is the trust anchor.
- “We paid a real worker” — the demo wallets are builder-controlled.
- “First on Arc” / “only on Arc” — not proven.
- “Guaranteed” / “risk-free” — not true.
- “Source verified” — unless the explorer shows it.
- “Production payroll” / “live payroll service” — it is a disclosed demo.
- “Testnet transaction” as mainnet proof — it is not.
- “Instant” as a product guarantee — the docs describe sub-second deterministic finality, but do not overpromise.

### 7.5 Production checklist

- [ ] Mainnet contract deployed and read-only script passes.
- [ ] A/B/C transactions complete; hashes recorded.
- [ ] App mainnet config merged; `/proof` and `Help` copy corrected.
- [ ] Source verification attempted; status recorded honestly.
- [ ] README placeholders replaced; repo public; host live.
- [ ] Video recorded in one clean browser profile; no secrets/PII.
- [ ] Captions match narration; claims match explorer.
- [ ] Final cut 2:30–2:55; no fake UI, no staged “success.”
- [ ] Video description includes contract, Studio, repo, and tx hashes.

---

## 8. Claim register

This is the master list for the package. Inline labels above are authoritative; this table is a quick audit.

| # | Claim | Label | Evidence |
|---:|---|---|---|
| 1 | ShiftProof is a per-shift USDC escrow with optional clock in/out, employer attestation, worker claim, permissionless residual refund, and employer cancel before clock-in. | **VERIFIED** | E18; E02 §1 |
| 2 | The contract has no admin, owner, pause, proxy, upgrade, fee, sweep, rescue, or native-value path. | **VERIFIED** | E18; E02 §4 |
| 3 | Source hash is `0x5d5e…e3ca`; compiler is `0.8.28+commit.7893614a`; EVM `cancun`; optimizer 200; `viaIR=false`; metadata `ipfs`. | **VERIFIED** | E06; E23 |
| 4 | Runtime artifact (zero immutables) is 5,990 bytes / `0xd76a…dca1`; expected mainnet runtime is `0x843e…b1e5`. | **VERIFIED** reconstruction | E23 |
| 5 | Testnet runtime is 5,990 bytes / `0x843e…b1e5`; matches expected after five immutable bytes. | **VERIFIED** | E04; E23 |
| 6 | 76/76 Studio tests passed; six invariants at 256 runs × 128,000 calls, 0 reverts. | **VERIFIED** | E03 |
| 7 | Fork E2E 3/3 passed with anvil + MockUSDC; this is not live USDC. | **VERIFIED** fork only; **UNVERIFIED** live | E17; E02 §2.3 |
| 8 | Frontend `check` and `vite build` passed. | **VERIFIED** | E16 |
| 9 | Testnet deployment at `0x3984…41a6`, tx `0x89b6…fd52`, block `69263663`, status 1. | **VERIFIED** | E04; E05 |
| 10 | Testnet reads: `usdc()=0x3600…0000`, `nextShiftId=1`, `totalEscrow=0`, caps as expected. | **VERIFIED** | E04 |
| 11 | Live-USDC testnet E2E with two real wallets was not run. | **UNVERIFIED** | E02 §3 |
| 12 | Explorer source verification was not achieved; testnet API returned bytecode only. | **VERIFIED** that it is unverified; **UNRESOLVED** mainnet path | E15 |
| 13 | No mainnet deployment, transaction, key access, or spend occurred. | **VERIFIED** | E02 §8; this session |
| 14 | Arc mainnet chain ID is 5042; RPC `https://rpc.mainnet.arc.io`; explorer `https://explorer.arc.io`. | **VERIFIED** | E10 |
| 15 | USDC is `0x3600…0000` on mainnet and testnet; ERC-20 interface uses 6 decimals. | **VERIFIED** | E09 |
| 16 | Native USDC gas uses 18 decimals; ERC-20 and native share one balance. | **VERIFIED** | E09; E11; E12 |
| 17 | Base fee floor is 20 Gwei; max fee below floor is dropped. | **VERIFIED** | E11; E12 |
| 18 | Finality is deterministic and sub-second. | **VERIFIED** | E12; docs |
| 19 | Blocklist reverts consume gas and have no rescue path in this contract. | **VERIFIED** | E12; E18 |
| 20 | The 40 USDC total cap is authorized, including optional S0 (36.25 planned). | **VERIFIED** | E24 §0.1; E01 2026-10-29 amendment |
| 21 | C4 is closed (2026-10-29 05:15 UTC); mainnet USDC is confirmed; Remix + Rabby (Path B) is primary. | **VERIFIED** | E24 §0.1 |
| 22 | The decision file still records the deployer/employer/worker wallets as `<ADDR>` placeholders; the actual public addresses and funding route are not in the package. | **UNRESOLVED** | E24 §0.1 |
| 23 | Path B (Remix + Rabby) is the primary path; Path A is dropped unless proven by 2026-10-29 and re-approved. | **VERIFIED** path; **UNVERIFIED** procedure | E24 §2.1, §2.11 |
| 24 | Arc Foundry install and `--ledger`/`--account` flags were not exercised in this environment; this affects Path A fallback only. | **UNVERIFIED** | This package §2.3 |
| 25 | Mainnet expected runtime hash is `0x843e…b1e5`; it has not been observed on mainnet. | **UNVERIFIED on-chain**; **VERIFIED** reconstruction | E23 |
| 26 | Constructor arg is `0x0000000000000000000000003600000000000000000000000000000000000000`. | **VERIFIED** | E06; E23 |
| 27 | No mainnet key was created, read, stored, or used by the agent. | **VERIFIED** | This session; E02 §8 |
| 28 | The app runtime/UI is currently testnet-only (`deployments.json`, `contract.ts`, `config.ts`, `Proof.tsx`, `Help.tsx`, `Layout.tsx`, `Home.tsx`, `ShiftCard.tsx`, `ShiftReceipt.tsx`). | **VERIFIED** | App source; E24 §5.11 |
| 29 | The app has not been switched to mainnet; no mainnet build is recorded. | **VERIFIED** current source; **UNVERIFIED** mainnet build | App source |
| 30 | Public repo `shiftproof` and Vercel preview are live; video is still a placeholder. | **VERIFIED** repo/preview; **UNRESOLVED** video | E24 §0.1; this session |
| 31 | The Studio project URL exists; public accessibility is not verified. | **VERIFIED** URL; **UNRESOLVED** access | E19 |
| 32 | The builder profile URL is `https://x.com/oxunify`; ownership is not independently verified. | **VERIFIED** URL; **UNVERIFIED** ownership | E20 |
| 33 | C2/C3 are waived, not satisfied; the demo uses builder-controlled wallets; no real worker pilot or legal review. | **VERIFIED** | E24 §0.2 |
| 34 | No security audit exists. | **VERIFIED** | E02 §3 |
| 35 | Employer attestation is the trust anchor; there is no dispute path. | **VERIFIED** | E18; app Help |
| 36 | No protocol fee, admin cut, or worker fee exists. | **VERIFIED** | E18 |
| 37 | A/B/C gross escrow is 35 USDC; gas cap 0.25; total 35.25; under 40. | **VERIFIED** arithmetic; **UNVERIFIED** execution | This package §5.1 |
| 38 | Optional S0 adds 1 USDC; total 36.25; under 40. | **VERIFIED** arithmetic; **UNVERIFIED** execution | This package §5.1, §5.10 |
| 39 | The read-only script passes with a mock `arc-cast` and the recorded testnet code; it has not been run on mainnet. | **VERIFIED** mock; **UNVERIFIED** live | This package §4.5 |
| 40 | The README draft includes an evidence table and inline citations; the full claim register is §8. | **VERIFIED** by inspection | This package §6, §8 |

---

## 9. Known discrepancies and required corrections

These are not cosmetic. Resolve or explicitly accept each one before execution.

| # | Discrepancy | Impact | Required action | Status |
|---:|---|---|---|---|
| 1 | **C4 is closed, but the actual public addresses are not recorded.** The 2026-10-29 05:15 amendment closes C4, confirms mainnet USDC, and authorizes a 40 USDC cap. The deployer/employer/worker fields are still `<ADDR>` placeholders. | Mainnet execution is not authorized; exact wallets/funding route are missing. | Fill the public addresses from the human’s records; do not generate or invent them. Mainnet deployment still needs separate approval. | **VERIFIED closure; UNRESOLVED addresses** |
| 2 | **Cap authorized; individual transactions not authorized.** The 40 USDC cap is authorized, but every mainnet transaction still needs per-transaction approval. The older Phase 1 §5 wording (“still proposed, not authorized for spend”) is superseded at the cap level. | A cap is not permission for any specific transaction. | Human must approve each transaction card, and separately approve the mainnet deploy. | **VERIFIED cap; UNRESOLVED execution** |
| 3 | **Deploy.s.sol gas check is missing.** `03-phase1-report.md` §1 and `02-architecture-spec.md` §15.5 say the script checks deployer gas balance; the actual script does not. | A dry run could pass with an unfunded deployer. | Add the external `arc-cast balance` check; correct the docs. | **UNRESOLVED** |
| 4 | **Deploy.s.sol accepts testnet.** It allows chain `5042002` as well as `5042`. | The script alone cannot enforce mainnet. | Require `arc-cast chain-id == 5042` and the mainnet RPC; record both. | **VERIFIED** behavior; **UNRESOLVED** process |
| 5 | **Spec path mismatch.** The spec’s verify command uses `src/ShiftProof.sol:ShiftProof`; the actual source is `contracts/ShiftProof.sol:ShiftProof`. | Verification command would fail. | Use the actual path in all commands. | **VERIFIED** |
| 6 | **Proof page test provenance.** `Proof.tsx` says “Confirmed locally with forge test”; Phase 1 says local Foundry was not installed. | False provenance claim. | Change to “Studio test run; raw log at `03-evidence/s2-forge-test.log`.” | **UNRESOLVED** |
| 7 | **Proof page bytecode label.** It labels “ABI match between artifact and deployed bytecode” false. The runtime bytecode matches except immutables; ABI is not bytecode. | Misleading status. | Split into “runtime bytecode matches artifact except immutables” and “source verified on explorer.” | **UNRESOLVED** |
| 8 | **Proof page app URL.** It calls the Studio preview the public app URL. Studio does not host public apps. A Vercel preview is live, but `Proof.tsx` is not yet wired to it. | Broken submission link until the prompt is run. | Run the prepared Studio prompt to use `window.location.origin`; do not hardcode a testnet preview as the mainnet app. | **UNRESOLVED** |
| 9 | **Several UI files show testnet facts.** `Help.tsx` says testnet only and hardcodes testnet RPC/explorer/faucet; `Layout.tsx` says “testnet only”; `Home.tsx` says “Arc Testnet”; `ShiftCard.tsx`/`ShiftReceipt.tsx` hardcode testnet explorer links. | Wrong after mainnet deploy; visible in the video. | Update all after a real mainnet deployment; keep the no-real-pilot disclosure. See §5.11. | **UNVERIFIED** |
| 10 | **No production build script.** `package.json` has `check` but no `build`; Phase 1 used `bunx vite build`. | README instructions may fail. | README now says `bunx vite build`; adding a `build` script remains optional. | **VERIFIED doc fix** |
| 11 | **`contracts:build`/`contracts:test` call `forge`, not `arc-forge`.** | Standard Foundry may not handle Arc-specific behavior. | Document or change the scripts; use `arc-forge` for Arc. | **UNRESOLVED** |
| 12 | **No `bun.lock`; forge-std commit not pinned; Arc Foundry version not recorded.** | Reproducibility gaps. | Add a lockfile; pin forge-std; record `arc-forge --version`. | **UNRESOLVED** |
| 13 | **No live-USDC testnet E2E.** Fork/MockUSDC cannot prove canonical USDC/blocklist behavior. | Mainnet-first risk. | Run the small live testnet E2E before mainnet, or explicitly accept the risk. | **UNVERIFIED** |
| 14 | **No explorer source verification.** | Judges cannot read verified source. | Try mainnet CLI/UI; publish source/hash fallback; never claim verified. | **UNRESOLVED** |
| 15 | **Mainnet source verification path is inferred.** Testnet is documented; mainnet API is Cloudflare-challenged. | Verification may fail. | Attempt after deploy; have the fallback ready. | **UNRESOLVED** |
| 16 | **App mainnet config missing.** | Cannot record the required mainnet video. | Complete §5.11, rebuild, test in a clean browser. | **UNVERIFIED** |
| 17 | **Video missing; repo/Vercel live.** Public repo `shiftproof` and Vercel preview are live in Phase 2b; video is still a placeholder. | Submission incomplete. | Record the video after mainnet; keep the repo and preview links current. | **VERIFIED repo/preview; UNRESOLVED video** |
| 18 | **C2/C3 waived, not satisfied.** | No real pilot/legal review. | Keep disclosed-demo framing; no real worker without jurisdiction check. | **VERIFIED waiver** |
| 19 | **Invariant count mismatch (corrected).** `03-phase1-report.md` §1/§2 said five invariants; `ShiftProof.t.sol` has six `invariant_*` functions and the S2 invariant suite reports 6 passed. | The test summary undercounted the invariant suite. | Phase 1 report and `app/README.md` now say “six invariants” and list them. | **VERIFIED corrected** |

---

## 10. Stop state and approval request

### 10.1 What is prepared

- `arc-pipeline/04-mainnet-package.md` (this file): compiler settings, constructor verification, bytecode hashes, deploy/Remix paths, approval cards, read-only verification, 40 USDC demo runbook, README draft, video script.
- `arc-pipeline/scripts/verify-mainnet-readonly.sh`: read-only post-deploy verifier; syntax-checked and mock-tested; not run on mainnet.
- `arc-pipeline/04-evidence/bytecode-analysis.json`: reproducible hash/size/immutable-offset record.

### 10.2 What has not happened

- No mainnet deployment.
- No mainnet transaction, approval, transfer, or spend.
- No mainnet key creation, access, storage, or use.
- No app mainnet configuration.
- No video.
- No source verification claim.
- C4 is closed and the 40 USDC cap is authorized, but the actual public addresses/funding route are not recorded.

**Status: `VERIFIED` — no mainnet write occurred. This session wrote local package/evidence/script files, created the curated public repo, deployed a testnet-only Vercel preview, and ran a mock verifier.**

### 10.3 Approval needed before any execution

1. **Fill the public addresses.** C4 is closed, but the deployer/employer/worker fields are still `<ADDR>`. Supply the public addresses and funding route from your records; do not let an agent invent them.
2. **Authorize the deploy and each transaction.** The 40 USDC cap is authorized. Approve the exact total (A/B/C 35.25, or with S0 36.25), the mainnet deploy, and every transaction card.
3. **Confirm Path B.** Path B (Remix + Rabby) is primary per the 2026-10-29 amendment. Path A is fallback only if proven by 2026-10-29 and re-approved.
4. **Approve the demo.** Confirm A/B/C amounts and the 17-transaction order; decide whether to include the optional 1 USDC S0 smoke test.
5. **Approve the mainnet app configuration.** The Studio prompt is prepared but not run; the preview is testnet-only. Approve the prompt, then update `deployments.json` and UI copy for mainnet.
6. **Approve the verification fallback.** If explorer verification fails, approve publishing the source/settings/constructor arg/hashes with the label “source published; explorer verification pending.”
7. **Approve the deploy card.** Only after 1–6: sign the deploy approval card. Do not deploy from this package alone.

### 10.4 Stop

I am stopping here. No mainnet action will be taken until the human fills the public addresses, authorizes the deploy and every transaction, confirms Path B, and signs the deploy card. **Mainnet deployment is not authorized.** The public repo and testnet-only Vercel preview are Phase 2b deliverables, not a mainnet substitute.

**Final status: C4 CLOSED; PHASE 2b DELIVERED; MAINNET EXECUTION AWAITING HUMAN APPROVAL.**

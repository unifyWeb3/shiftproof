# ShiftProof — Arc Mainnet Deployment Verification

**Verdict: PROCEED WITH DOCUMENTED DEVIATION.** The deployment at `0x2A88dDe461280F5a3Ad959fd6997388409e766a9` is readable, its public state matches the expected initial values, and Sourcify reports an **exact source match** for both creation and runtime. The official read-only verifier still exits `1` because the deployed runtime was compiled with **optimizer disabled**, while the frozen artifact was compiled with **optimizer enabled, 200 runs**. The source is identical; only the compiler setting and resulting bytecode differ. This deviation is disclosed here and in the app.

This supersedes the earlier `0x33731b4ce58bd5b26736c2f95a8f8e9c56e6ce15` deployment, which was stopped because its bytecode mismatch was unexplained.

This is not an audit. Mainnet USDC has real value. Do not use this contract with real workers.

---

## 1. Deployment facts (RPC reads only)

| Field | Value |
|---|---|
| Network | Arc Mainnet, chain ID `5042` (`0x13b2`) |
| RPC | `https://rpc.mainnet.arc.io` |
| Deploy transaction | `0x9b56fa49c2c78b78ac24c7f4f154d4825194c6939b05f4e8086a8d5e10336d98` |
| Transaction type | EIP-1559 (`0x2`) |
| Transaction nonce | `2` |
| Transaction `to` | `null` (contract creation) |
| Transaction value | `0` |
| Transaction input size | `11,652` bytes |
| Receipt status | `0x1` (success) |
| Block | `28,736,878` (`0x1b678ee`) |
| Block hash | `0xb66da58bccd8036b0e05ae7b5cb546c45e9cdb3d4f5380c13051688dd31180fc` |
| Block timestamp | `2026-10-31T01:11:14Z` (`1793409074`) |
| Deployer | `0x3211d1419709682b81c53cc51cb63622e25488d3` |
| Contract address (receipt) | `0x2A88dDe461280F5a3Ad959fd6997388409e766a9` |
| Contract address derived from `deployer + nonce 2` | `0x2A88dDe461280F5a3Ad959fd6997388409e766a9` — matches receipt |
| Constructor USDC argument (last 32 bytes of tx input) | `0x0000000000000000000000003600000000000000000000000000000000000000` |
| Gas limit | `3,714,771` |
| Gas used | `2,455,856` |
| Effective gas price | `20,001,000,000` wei |
| Runtime code at deploy block | `10,864` bytes |
| Runtime code at latest block | `10,864` bytes |
| Runtime code stable across both reads | yes |

The contract address was taken from the deployment receipt and independently re-derived from the deployer address and nonce `2`. It was not inferred from the truncated address in the request.

The constructor argument decodes to the USDC address `0x3600000000000000000000000000000000000000`, which is also what `usdc()` returns on-chain.

---

## 2. Source verification (Sourcify)

Sourcify API: `https://sourcify.dev/server/v2/contract/5042/0x2A88dDe461280F5a3Ad959fd6997388409e766a9`

| Field | Result |
|---|---|
| `creationMatch` | `exact_match` |
| `runtimeMatch` | `exact_match` |
| `match` | `exact_match` |
| `verifiedAt` | `2026-10-31T01:11:30Z` |
| `matchId` | `57750513` |
| Repository page | `https://repo.sourcify.dev/5042/0x2A88dDe461280F5a3Ad959fd6997388409e766a9` |
| Compiler | `solc 0.8.28+commit.7893614a` |
| EVM version | `cancun` |
| Optimizer | **disabled** (`enabled: false`, `runs: 200`) |
| Metadata bytecode hash | `ipfs` |
| Fully qualified name | `contracts/shiftproof.sol:ShiftProof` |

The Sourcify source is **13,038 bytes** and is identical to `app/contracts/ShiftProof.sol` except for a trailing newline. The local file is **13,039 bytes**. A `diff` shows only:

```diff
@@ -326,4 +326,4 @@
         }
         return result;
     }
-}
+}
\ No newline at end of file
```

The ABI entries are a set-equivalent match: 40 entries on both sides, with no function, event, or error signature present on only one side. The app uses the frozen artifact ABI; every callable signature is the same.

---

## 3. Official verifier output

Command run from the repository root:

```bash
CAST_BIN=/tmp/opencode/cast-shim.mjs \
ARC_MAINNET_RPC=https://rpc.mainnet.arc.io \
bash arc-pipeline/scripts/verify-mainnet-readonly.sh \
  0x2A88dDe461280F5a3Ad959fd6997388409e766a9 1 0
```

The verifier script itself was not modified. Exit code: `1`.

```text
ShiftProof read-only verification
  RPC:      https://rpc.mainnet.arc.io
  Contract: 0x2A88dDe461280F5a3Ad959fd6997388409e766a9
  USDC:     0x3600000000000000000000000000000000000000
  Artifact: /root/arc/app/contracts/out/ShiftProof.sol/ShiftProof.json

PASS  chain ID is 5042 (Arc Mainnet)
FAIL  runtime code size is 10864 bytes, expected 5990
PASS  usdc() is 0x3600000000000000000000000000000000000000
PASS  nextShiftId() is 1
PASS  totalEscrow() is 0 (6-decimal base units)
PASS  USDC decimals() is 6
PASS  USDC symbol() is USDC
INFO  MAX_HOURLY_RATE=1000000000 MAX_SHIFT_SECONDS=86400 MAX_ESCROW=10000000000
FAIL  runtime keccak256 is '0x83cd0dd06d49f7493eda6dea3f2a2042f04d5ba724bcb22a7f41200dce41bb4a', expected 0x843ef44664f6eb7bbbe95c213d6fd60b88d912b3810d087981ab69a94b90b1e5
FAIL  code length 10864 != expected 5990
FAIL  on-chain code differs from the frozen artifact at 5748 byte(s)
      offset 23: on-chain 0xf3, expected 0xf0
      offset 39: on-chain 0x95, expected 0x93
      offset 50: on-chain 0x64, expected 0x63
      offset 61: on-chain 0x6f, expected 0x1d
      offset 72: on-chain 0x8d, expected 0x26
      offset 83: on-chain 0xab, expected 0x32
      offset 94: on-chain 0xc7, expected 0x45
      offset 96: on-chain 0x61, expected 0x5f
      offset 97: on-chain 0x00, expected 0x5f
      offset 98: on-chain 0xf3, expected 0xfd
      offset 99: on-chain 0x56, expected 0x5b
      offset 100: on-chain 0x5b, expected 0x80
      offset 101: on-chain 0x80, expected 0x63
      offset 102: on-chain 0x63, expected 0x47
      offset 103: on-chain 0x47, expected 0xeb
      offset 104: on-chain 0xeb, expected 0x17
      offset 105: on-chain 0x17, expected 0xa1
      offset 106: on-chain 0xa1, expected 0x14
      offset 107: on-chain 0x14, expected 0x61
      offset 108: on-chain 0x61, expected 0x01
      ... 5728 more
FAIL  exact bytecode comparison

RESULT: FAIL - stop. Do not fund or use this contract until the mismatch is explained.
```

**Why the verifier fails:** the verifier compares against the frozen artifact built with optimizer enabled (200 runs). The deployed contract was compiled from the same source with optimizer disabled. Sourcify independently compiled the supplied source with optimizer disabled and got an exact creation and runtime match. The mismatch is therefore explained by compiler settings, not by a source difference. The verifier's `RESULT` line is the frozen-artifact comparison and remains a legitimate failure; it is not evidence of a different contract.

### Tooling note

`arc-cast` is not installed in this environment. To execute the official verifier script unchanged, `CAST_BIN` was pointed at a minimal, read-only, cast-compatible shim at `/tmp/opencode/cast-shim.mjs`.

The shim implements only the four subcommands the verifier uses:

- `chain-id` → `eth_chainId`
- `code` → `eth_getCode`
- `call` → `eth_call` with the requested function signature
- `keccak` → local keccak256

It has no signing path, no private-key input, and no transaction broadcast. It does not hardcode or substitute any contract value; every value is read from `https://rpc.mainnet.arc.io`.

| Tooling artifact | SHA-256 |
|---|---|
| Verifier output (`/tmp/opencode/verify-mainnet-new.out`) | `c769818f5ad43838aad55bb0095d83ece29887c19addf07241b5ed2e80353820` |
| Read-only cast shim (`/tmp/opencode/cast-shim.mjs`) | `5e448ad5035fe2b2721af2f550904456db4c584f5af18700f2d7bbd9ffa2c5c9` |
| Sourcify API response (`/tmp/opencode/sourcify-new.json`) | `81863de14c815bc4a36a42b6fc8546ea72bd583ef3b911477a8f199b4dc2f349` |
| Sourcify source (`/tmp/opencode/sourcify-shiftproof.sol`) | `cd9df4814375d5c933ca03b5bb6088f31006bef0e54207f4951f5687a7f00f44` |
| Local source (`app/contracts/ShiftProof.sol`) | `80c1f314b54d4579a09923bbbafdf808d52b9f84b003928fe3e6abb6a3a9f5c5` |
| Frozen artifact (`app/contracts/out/ShiftProof.sol/ShiftProof.json`) | `c298d882e2db80a014a3c89e36076fe741d0f11f166c107994915340cab62dcb` |

---

## 4. Public reads

All reads below are from the same RPC and contract.

| Read | Result | Status |
|---|---|---|
| `usdc()` | `0x3600000000000000000000000000000000000000` | PASS |
| `nextShiftId()` | `1` | PASS |
| `totalEscrow()` | `0` (6-decimal base units) | PASS |
| USDC `decimals()` | `6` | PASS |
| USDC `symbol()` | `USDC` | PASS |
| `MAX_HOURLY_RATE()` | `1000000000` | INFO |
| `MAX_SHIFT_SECONDS()` | `86400` | INFO |
| `MAX_ESCROW()` | `10000000000` | INFO |

These reads confirm that the deployed contract exposes the expected ShiftProof interface and initial state.

---

## 5. Bytecode comparison

| Item | Frozen artifact (optimizer on, 200 runs) | Deployed mainnet (optimizer off) |
|---|---|---|
| Creation bytecode / deploy input | `6,392` bytes creation code + 32-byte constructor arg = `6,424` bytes | `11,620` bytes creation code + 32-byte constructor arg = `11,652` bytes transaction input |
| Runtime size | `5,990` bytes | `10,864` bytes |
| Runtime keccak256 | `0x843ef44664f6eb7bbbe95c213d6fd60b88d912b3810d087981ab69a94b90b1e5` | `0x83cd0dd06d49f7493eda6dea3f2a2042f04d5ba724bcb22a7f41200dce41bb4a` |
| Exact match after patching USDC immutables | — | **false** |
| Differing byte positions | — | `5,748` |

The verifier patches the frozen artifact's zero-filled immutable USDC regions at offsets `395 1474 1932 2394 4141` before comparing. That patched artifact hashes to the expected runtime hash. The deployed code is 4,874 bytes larger because optimizer-disabled code is less compact.

### Hash register

| Hash / value | Result |
|---|---|
| Deploy transaction | `0x9b56fa49c2c78b78ac24c7f4f154d4825194c6939b05f4e8086a8d5e10336d98` |
| Deploy block hash | `0xb66da58bccd8036b0e05ae7b5cb546c45e9cdb3d4f5380c13051688dd31180fc` |
| Mainnet runtime keccak256 | `0x83cd0dd06d49f7493eda6dea3f2a2042f04d5ba724bcb22a7f41200dce41bb4a` |
| Expected optimized runtime keccak256 | `0x843ef44664f6eb7bbbe95c213d6fd60b88d912b3810d087981ab69a94b90b1e5` |
| Frozen artifact raw `deployedBytecode` keccak256 (zero-filled immutables) | `0xd76ac4fd9070d98a1faa08865da36eb2111f634762945c1234e8391e4cdbdca1` |
| Frozen artifact patched with USDC immutables keccak256 | `0x843ef44664f6eb7bbbe95c213d6fd60b88d912b3810d087981ab69a94b90b1e5` |
| Frozen artifact file SHA-256 | `c298d882e2db80a014a3c89e36076fe741d0f11f166c107994915340cab62dcb` |

The deployment's metadata trailer is consistent with solc `0.8.28`. The cause of the bytecode difference is **VERIFIED** as the optimizer setting: Sourcify compiled the same source with optimizer disabled and matched both creation and runtime exactly.

---

## 6. App integration

`app/src/lib/networks.ts` mainnet entry:

| Field | Value |
|---|---|
| `contractAddress` | `0x2A88dDe461280F5a3Ad959fd6997388409e766a9` |
| `deploymentBlock` | `28736878n` |
| `deploymentTx` | `0x9b56fa49c2c78b78ac24c7f4f154d4825194c6939b05f4e8086a8d5e10336d98` |
| `isConfigured` | `true` |
| `chainId` | `5042` |
| `rpcUrl` | `https://rpc.mainnet.arc.io` |
| `explorerUrl` | `https://explorer.arc.io` |
| `usdcAddress` | `0x3600000000000000000000000000000000000000` |

The mainnet entry is a manual, data-only edit. Testnet is unchanged.

`hasContract` now fails closed. It returns true only when `isConfigured` is true, the contract address matches `^0x[0-9a-fA-F]{40}$`, `deploymentBlock > 0`, the deployment transaction matches `^0x[0-9a-fA-F]{64}$`, and the USDC address is well-formed. Missing or malformed mainnet data disables all contract reads and writes.

The UI was updated so mainnet builds do not claim the optimized artifact matches:

- `app/src/pages/Proof.tsx` shows Sourcify `exact_match` status and a Sourcify link, explains the optimizer-disabled difference, and uses mainnet-specific E2E caveats.
- `app/src/pages/Help.tsx` answers “Is this on mainnet?” with the deployed address, the real-USDC risk, and the optimizer/audit caveats.
- `app/README.md` records the manual mainnet configuration and the optimizer difference.
- Root `README.md` records the mainnet status, evidence, runtime rows, and limitations.

---

## 7. Smallest rate and hours the UI accepts

The employer form computes:

```ts
const rateRaw = rateStr ? parseUsdcInput(rateStr) : 0n
const maxSecs = hoursStr ? Math.round(parseFloat(hoursStr) * 3600) : 0
const createReady = workerAddrValid && rateRaw > 0n && maxSecs > 0
```

- **Smallest rate the UI accepts:** `0.000001` USDC/hr (`1` raw 6-decimal unit). A seventh decimal is rejected by `parseUnits`, producing `0n`.
- **Smallest hours the UI accepts:** `0.000139` hours. `0.000139 × 3600 = 0.50004`, which rounds to `1` second. Smaller positive values (for example `0.000138`) round to `0` and do not satisfy `maxSecs > 0`.
- **Contract-valid minimums:** the contract computes `escrow = hourlyRate × maxSeconds / 3600` and reverts with `InvalidAmount` when `escrow == 0`. At the UI minimum rate, `1 raw × 1s` produces `0` escrow and reverts. The smallest contract-valid pairs are:
  - `0.000001` USDC/hr × `1` hour (`1 raw` escrow), or
  - `0.0036` USDC/hr × `0.000139` hours (`1s`, `1 raw` escrow).

**UX edge:** `createReady` does not require `escrowNeeded > 0n`, so the absolute smallest UI values enable the button but fail at simulation. This is a UI validation gap, not a contract bug; no code change was made for it in this integration.

---

## 8. Build and check results

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` | PASS, exit `0` |
| Typecheck (full repo) | `npm run typecheck` | FAIL, exit `1`: pre-existing `scripts/compass-deploy.ts(14,26)` cannot find `@circlefin/compass-chains` |
| Typecheck (`src` only) | `npx tsc --noEmit -p tsconfig.src-check.json` | PASS, exit `0` |
| Testnet build | `VITE_NETWORK=testnet npx vite build --outDir /tmp/opencode/dist-testnet-final` | PASS, exit `0`, 6,506 modules |
| Mainnet build | `VITE_NETWORK=mainnet npx vite build` | PASS, exit `0`, 6,506 modules |

The full-repo typecheck failure is in a pre-existing deployment script, not in `src`. The required `src` typecheck passes. The `tsconfig.src-check.json` file was temporary and was removed after the check.

Both builds emit the same Rollup warnings about third-party `/*#__PURE__*/` comment positions and chunks larger than 500 kB. Neither warning is an error.

The browser title was corrected from the hardcoded “ShiftProof — Arc Testnet” to a neutral static title plus a runtime `document.title = "ShiftProof — <network label>"`. On the mainnet preview the title is `ShiftProof — Arc`.

---

## 9. `/proof` mainnet check

The deployed preview was rendered in headless Chromium at:

`https://shiftproof-pbli3fxwu-oxunify.vercel.app/proof`

Rendered title: `ShiftProof — Arc`. Console errors: none.

Visible values:

| Item | Rendered value |
|---|---|
| Network | `Arc (chain 5042)` |
| Live chain ID | `5042` |
| Live block | `28,742,648` (at check time) |
| Contract | `0x2A88dDe461280F5a3Ad959fd6997388409e766a9` |
| Deploy tx | `0x9b56...6d98` |
| Deployment block | `28,736,878` |
| Code size | `10864 bytes` |
| Runtime hash | `0x83cd0dd06d49f7493eda6dea3f2a2042f04d5ba724bcb22a7f41200dce41bb4a` |
| `usdc()` | `0x3600000000000000000000000000000000000000` |
| USDC `decimals()` | `6` |
| `nextShiftId()` | `1` |
| `totalEscrow()` | `0.00 USDC` |
| Sourcify status | `Source verified on Sourcify: exact match` |
| E2E status | `UNVERIFIED` — no live two-wallet mainnet E2E |

Rendered links:

| Link | URL |
|---|---|
| Contract | `https://explorer.arc.io/address/0x2A88dDe461280F5a3Ad959fd6997388409e766a9` |
| Deploy tx | `https://explorer.arc.io/tx/0x9b56fa49c2c78b78ac24c7f4f154d4825194c6939b05f4e8086a8d5e10336d98` |
| USDC | `https://explorer.arc.io/address/0x3600000000000000000000000000000000000000` |
| Sourcify | `https://repo.sourcify.dev/5042/0x2A88dDe461280F5a3Ad959fd6997388409e766a9` |
| Public repo | `https://github.com/unifyWeb3/shiftproof` |

The page contains no “testnet only,” “not deployed,” or “No ShiftProof contract” text. The optimizer-disabled explanation is visible. A full-page screenshot was captured at `/tmp/opencode/proof-mainnet.png`.

---

## 10. Commit, push, and preview deployment

| Item | Value |
|---|---|
| Build environment | `VITE_NETWORK=mainnet` |
| Vercel target | Preview (not production) |
| Preview URL | `https://shiftproof-pbli3fxwu-oxunify.vercel.app` |
| `/proof` URL | `https://shiftproof-pbli3fxwu-oxunify.vercel.app/proof` |
| Deployment ID | `dpl_F94YhSdGrbunBHfjnxLdYSbFeWtq` |
| Inspector | `https://vercel.com/oxunify/shiftproof/F94YhSdGrbunBHfjnxLdYSbFeWtq` |
| Build result | READY; Vite build completed in 23.95s |

The deployment was created with `vercel deploy --yes -b VITE_NETWORK=mainnet` from `app/`. It was not promoted to production.

Commit and push are recorded in the final report for this session. No unrelated working-tree files were committed.

---

## 11. What was and was not done

**Done:**

- Verified the new deployment's transaction, receipt, block, address derivation, constructor argument, and runtime code via RPC.
- Confirmed Sourcify creation and runtime `exact_match`.
- Ran the official read-only verifier unchanged; captured its full output and exit code.
- Read the public state and caps.
- Configured mainnet in `app/src/lib/networks.ts` with fail-closed validation.
- Updated mainnet proof/help copy and both READMEs.
- Ran lint, `src` typecheck, testnet build, and mainnet build.
- Rendered the mainnet `/proof` page and checked live values and links.
- Committed the integration, scanned for secrets, pushed, and deployed a Vercel preview.

**Not done:**

- No production deployment.
- No contract change or redeployment.
- No live two-wallet mainnet E2E, no mainnet demo shifts, and no funding of the contract.
- No audit.
- No fix for the pre-existing full-repo typecheck failure in `scripts/compass-deploy.ts`.
- No fix for the UI `createReady` escrow-zero edge; it is reported above.

---

## 12. Required follow-ups

1. Re-run the official verifier with `arc-cast` and, if the project wants a clean `exit 0`, rebuild the frozen artifact with optimizer disabled or redeploy the optimized artifact.
2. Add `escrowNeeded > 0n` to `createReady` so the UI does not enable a transaction that will revert at the smallest inputs.
3. Run a live two-wallet mainnet E2E with small amounts only after legal review and explicit approval.
4. Obtain an audit before any production payroll use.

# ShiftProof

Per-shift USDC escrow and attestation for gig workers. An employer locks USDC into a shift contract; the worker optionally clocks in and out; the employer attests the hours worked; the worker claims their pay; anyone can trigger the residual refund to the employer.

Built with [Arc Studio](https://studio.arc.io)

## Tech stack

- Solidity 0.8.28, EVM Cancun, Foundry
- OpenZeppelin SafeERC20 + ReentrancyGuard
- Target chain: Arc Testnet (5042002) / Arc Mainnet (5042)
- Token: USDC (6 decimals)
- Frontend: Vite + React 18 + TypeScript + Tailwind CSS + wagmi + viem + ConnectKit

## Deployed contracts

| Network | Address | Explorer |
|---|---|---|
| Arc Testnet (5042002) | `0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6` | [View](https://explorer.testnet.arc.io/address/0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6) |
| Arc Mainnet (5042) | `0x2A88dDe461280F5a3Ad959fd6997388409e766a9` | [View](https://explorer.arc.io/address/0x2A88dDe461280F5a3Ad959fd6997388409e766a9) |

### Manual mainnet configuration

The mainnet entry in `src/lib/networks.ts` is a manual, data-only edit:

- `contractAddress`: `0x2A88dDe461280F5a3Ad959fd6997388409e766a9`
- `deploymentBlock`: `28736878`
- `deploymentTx`: `0x9b56fa49c2c78b78ac24c7f4f154d4825194c6939b05f4e8086a8d5e10336d98`
- `isConfigured`: `true`

The values come from the verified deployment receipt. Testnet is unchanged. If any of these fields is missing or malformed, `hasContract` evaluates false and all contract reads/writes stay disabled (fail closed).

### Mainnet deployment provenance

The mainnet contract was deployed manually from Remix using the unchanged `contracts/ShiftProof.sol` source. The mainnet entry in `src/lib/networks.ts` is a manual, data-only edit; testnet is unchanged.

- Remix compiler: `solc 0.8.28+commit.7893614a`, EVM `cancun`.
- Remix optimizer: **disabled** (metadata records `runs: 200` but `enabled: false`).
- Metadata bytecode hash: `ipfs`.
- Constructor USDC: `0x3600000000000000000000000000000000000000`.
- Sourcify: [creation and runtime `exact_match`](https://repo.sourcify.dev/5042/0x2A88dDe461280F5a3Ad959fd6997388409e766a9).
- Deployed runtime: 10,864 bytes, keccak `0x83cd0dd06d49f7493eda6dea3f2a2042f04d5ba724bcb22a7f41200dce41bb4a`.
- Production app: [shiftproof-phi.vercel.app](https://shiftproof-phi.vercel.app), Vercel deployment `dpl_Bj9PawyUuUnAsytvkAjEoS379Js1` (target `production`, no deployment protection), built with `VITE_NETWORK=mainnet`.

The frozen Studio artifact in `contracts/out/ShiftProof.sol/ShiftProof.json` was built with optimizer **enabled, 200 runs**. Its runtime is 5,990 bytes, keccak `0x843ef44664f6eb7bbbe95c213d6fd60b88d912b3810d087981ab69a94b90b1e5`. The deployed runtime does **not** match it. The read-only verifier exits `1` on the size/hash/exact comparison; this is a compiler-setting difference, not a source difference, and the deployed contract must not be described as matching the frozen optimized bytecode.

Source hash comparison: the local 13,039-byte source hashes to `0x5d5e2edb0e2cea4601933f12b2a59bd4e0424d07375323404e0df5c2813ae3ca`, matching `arc-pipeline/04-mainnet-package.md`. The Sourcify-deployed source is 13,038 bytes and hashes to `0x73e4d9bf3e261cb6aa50e901d4c8fe5e86e5a9b049c949d25cc0f7c170cc0c84` because it lacks the local file's single trailing newline; the Solidity is otherwise identical. Sourcify's exact match establishes that the deployed source compiles to the deployed bytecode with optimizer disabled. It does not establish byte-identical source with the frozen file or bytecode equality with the optimized artifact.

## Contract files

| File | Purpose |
|---|---|
| `contracts/ShiftProof.sol` | Main contract |
| `contracts/test/ShiftProof.t.sol` | Unit, fuzz, and invariant tests |
| `contracts/test/MockUSDC.sol` | Test-only ERC-20 mock (never deployed) |
| `contracts/script/Deploy.s.sol` | Deploy script with chain/USDC pre-flight checks |

## Development

### Prerequisites

- [Bun](https://bun.sh) v1+
- [Foundry](https://book.getfoundry.sh) (`forge` in PATH)

### Install

```bash
bun install
```

### Build contracts

```bash
bun run contracts:build
```

### Test contracts

```bash
bun run contracts:test
```

Runs 76 tests: unit matrix (U01-U40), transition matrix (T01-T16), fuzz (rate / duration / attested seconds / random actors), and six Foundry invariants: solvency, `totalEscrow` sum, `owed <= escrow`, claimed implies `owed == 0`, settled implies zero escrow/owed, and cancelled implies zero escrow/owed.

**E2E status (Phase 1):** Fork-based E2E with 3 flows passed using MockUSDC (Arc Testnet USDC calls a precompile absent in vanilla anvil — see `TESTNET-E2E.md`). Live USDC E2E with two real Rabby wallets on Arc Testnet has **not** been verified; the acceptance checklist is `TESTNET-E2E-LIVE.md`. Phase 1 targeted Arc Testnet; the mainnet deployment is recorded above.

### Run frontend dev server

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173). Connect an injected EVM wallet (MetaMask, Rabby) on Arc Testnet (chain ID 5042002) to make transactions. Read-only browsing works without a wallet.

### Build frontend

```bash
bunx vite build
```

### Lint and typecheck

```bash
bun run check
```

### Frontend routes

| Route | Description |
|---|---|
| `/` | Home — live stats, shift-ID lookup, how it works |
| `/employer` | Create shifts, attest hours, cancel (Funded only), refundUnused |
| `/worker` | Clock in (Funded) / out (Active), claim (Attested) |
| `/shift/:id` | Public read-only receipt — full tuple, timestamps, tx hashes |
| `/proof` | Submission/judge page — deployment facts, verification status |
| `/help` | FAQ, status flow, risk disclosures, contract reference |

### Environment variables

None required for building, testing, or running the frontend locally. Deployment is a human step: use Remix + Rabby (Path B) or a hardware wallet with Foundry, and never paste a private key or seed phrase into this repo, the app, or an agent session. The RPC URL is chosen in the wallet or deploy tool, not stored here.

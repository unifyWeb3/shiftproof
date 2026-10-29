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

Runs 76 tests: unit matrix (U01-U40), transition matrix (T01-T16), fuzz (rate / duration / attested seconds / random actors), and five Foundry invariants (solvency, totalEscrow sum, owed <= escrow, no double-claim, terminal-state zeroing).

**E2E status (Phase 1):** Fork-based E2E with 3 flows passed using MockUSDC (Arc Testnet USDC calls a precompile absent in vanilla anvil — see `TESTNET-E2E.md`). Live USDC E2E with two real Rabby wallets on Arc Testnet has **not** been verified. Phase 1 target is Arc Testnet only; no mainnet deployment.

### Run frontend dev server

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173). Connect an injected EVM wallet (MetaMask, Rabby) on Arc Testnet (chain ID 5042002) to make transactions. Read-only browsing works without a wallet.

### Build frontend

```bash
bun run build
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

None required for building, testing, or running the frontend locally. Deploy requires a funded wallet and an RPC endpoint for Arc Mainnet or Testnet; supply them via Foundry's `--rpc-url` and `--private-key` flags (or environment variables) at deploy time.

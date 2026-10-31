# ShiftProof

> Built with Arc Studio - money-powered apps in minutes

This is the **project memory** for ShiftProof V1.

---

## What This App Does

ShiftProof is a per-shift USDC escrow and attestation protocol. An employer funds a shift with USDC; the worker optionally clocks in/out; the employer attests worked seconds; the worker claims their pay; anyone can trigger the residual refund to the employer. No admin, no upgrade, no fees.

## Tech Stack

- Contracts: Solidity 0.8.28 + Foundry (evm_version = cancun, optimizer 200 runs)
- Token: USDC 6-decimal (Arc Testnet: 0x3600000000000000000000000000000000000000)
- Chain: Arc Testnet (5042002) / Arc Mainnet (5042)
- OZ: SafeERC20, ReentrancyGuard

## Key Files

- `contracts/ShiftProof.sol` — main contract (deployed on Arc Mainnet)
- `contracts/test/ShiftProof.t.sol` — unit, fuzz, invariant tests (76 tests, all pass)
- `contracts/test/MockUSDC.sol` — test-only 6-decimal ERC-20 + reentrant mock
- `contracts/script/Deploy.s.sol` — deploy script (asserts chain 5042/5042002, USDC addr, decimals)

## Contract State

| Contract | Network | Address | Status |
|---|---|---|---|
| ShiftProof | Arc Testnet (5042002) | 0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6 | Deployed 2026-10-27 |
| ShiftProof | Arc Mainnet (5042) | 0x2A88dDe461280F5a3Ad959fd6997388409e766a9 | Deployed 2026-10-31; optimizer disabled |

- Deployer: testnet platform wallet (disposable, not user-owned)
- Tx hash: 0x89b616d394bd6b834901e24d3651fd05bdcbe4d84dae64befeb5fc5f40dcfd52
- Explorer: https://explorer.testnet.arc.io/address/0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6
- Source verification: not available via explorer API at deploy time
- E2E validation: see `TESTNET-E2E.md` and `testnet-e2e.json` (3/3 flows PASS, fork lane)

Mainnet deployment notes:

- Tx hash: `0x9b56fa49c2c78b78ac24c7f4f154d4825194c6939b05f4e8086a8d5e10336d98`, block `28736878`.
- Remix settings: solc `0.8.28+commit.7893614a`, Cancun, optimizer **disabled**. The frozen Studio artifact used optimizer enabled with 200 runs and does **not** match the deployed runtime.
- Sourcify: creation and runtime `exact_match` — https://repo.sourcify.dev/5042/0x2A88dDe461280F5a3Ad959fd6997388409e766a9
- Live two-wallet E2E verified read-only on-chain 2026-10-31 (`arc-pipeline/03-evidence/mainnet-live-e2e.md`): approve → create → clock-in → clock-out → attest → claim → Settled for shift #1, 0.15 USDC. Employer attestation remains the trust anchor; no audit.
- Production app: https://shiftproof-phi.vercel.app (`VITE_NETWORK=mainnet`, Vercel target `production`).
- No audit. Mainnet USDC has real value. Do not use with real workers.

## Decisions

- `nextShiftId` starts at 1; 0 is "not found".
- Floor division (hourlyRate * seconds / 3600) favours employer by at most 1 micro-USDC.
- `createShift`: inbound `safeTransferFrom` happens BEFORE state write (one inbound transfer exception to CEI, per spec S5.4).
- `claim`/`refundUnused`/`cancel`: state written BEFORE outbound transfer (strict CEI), all `nonReentrant`.
- `ReentrantMockToken._doTransfer` bubbles up inner reverts so the outer guarded call also fails cleanly in tests.

## To Build / Test

```bash
bun run contracts:build   # forge build
bun run contracts:test    # forge test
```

# ShiftProof V1 — Arc Testnet E2E Validation

**Date:** 2026-10-27  
**Live contract:** `0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6` (Arc Testnet, chain ID 5042002)  
**All flows:** PASSED (3/3)

---

## Method

An `anvil` fork of Arc Testnet was started at the current chain tip (block ~69264626).
Fresh `MockUSDC` and `ShiftProof` instances were deployed onto the fork using the compiled
bytecode from `contracts/out/`. All transactions were sent from impersonated accounts with
no private keys held or stored. Results were written to `testnet-e2e.json`.

**Tooling:**
- `anvil` v1.7.1 (Foundry) — Arc Testnet fork (`https://rpc.testnet.arc.io`, chain ID 5042002)
- `bun run fork-tests/shiftproof-e2e.ts` — viem-based TypeScript test runner
- Script: `fork-tests/shiftproof-e2e.ts`

**Wallets (impersonated, no private keys):**

| Role | Address |
|---|---|
| Employer | `0x1111111111111111111111111111111111111111` |
| Worker | `0x2222222222222222222222222222222222222222` |
| Third party | `0x3333333333333333333333333333333333333333` |

---

## Fork Limitation

Arc Testnet USDC (`0x3600000000000000000000000000000000000000`) calls a chain-specific
precompile at `0x1800000000000000000000000000000000000001` (blocklist check) inside every
`transfer`/`transferFrom`. This precompile does not exist in vanilla `anvil`, so calling the
live deployed ShiftProof against real Arc USDC reverts with `StackUnderflow`.

**Resolution:** Fork tests deployed a fresh `ShiftProof` instance using `MockUSDC` (same
6-decimal ERC-20 interface, no precompile calls). The ShiftProof bytecode tested is identical
to the live deployment; only the USDC token address differs. This is a testnet infrastructure
constraint, not a contract defect.

To verify the live contract against real Arc USDC, a live-wallet testnet run (employer/worker
wallets funded via faucet, real tx submissions) is required — see "Future work" below.

---

## Flow 1: Happy path (2h @ 5 USDC/h, attest 1.5h)

**Shift ID:** 1  
**Escrow:** 10 USDC | **Owed:** 7.5 USDC | **Refund:** 2.5 USDC

| Step | Tx hash | Block | Gas used |
|---|---|---|---|
| `createShift` | `0xe5f630b8…57308d` | 69264630 | 223,409 |
| `clockIn` | `0x783cf4fb…b13d7` | 69264631 | 35,901 |
| `clockOut` | `0xabc86de5…32299` | 69264632 | 36,016 |
| `attest(5400s)` | `0x3485d3a7…3b0b1` | 69264633 | 63,681 |
| `claim` | `0xdc77263f…3e2a` | 69264634 | 77,258 |
| `refundUnused` | `0x65e5d5a7…6d49` | 69264635 | 52,991 |

**Final state:** `Settled` | escrow=0 | worker +7.5 USDC | employer -7.5 USDC (net)  
**`totalEscrow` before == after:** confirmed  
**Result: PASS**

---

## Flow 2: Cancel before clock-in (1h @ 4 USDC/h)

**Shift ID:** 2  
**Escrow:** 4 USDC

| Step | Tx hash | Block | Gas used |
|---|---|---|---|
| `createShift` | `0xcced95b9…f233` | 69264636 | 223,397 |
| `cancel` | `0x4e129af1…a50d` | 69264637 | 49,752 |

**Final state:** `Cancelled` | escrow=0 | employer net 0 (paid 4, refunded 4) | worker unchanged  
**Result: PASS**

---

## Flow 3: Zero attestation (1h @ 3 USDC/h)

**Shift ID:** 3  
**Escrow:** 3 USDC

| Step | Tx hash | Block | Gas used |
|---|---|---|---|
| `createShift` | `0xe11a4981…e5d7` | 69264638 | 223,409 |
| `clockIn` | `0x3b04b660…7b9b9` | 69264639 | 35,901 |
| `clockOut` | `0x8a6b2228…80ab` | 69264640 | 36,016 |
| `attest(0s)` | `0x55015aeb…8e41` | 69264641 | 40,957 |
| `claim()` | — | — | Reverted `NothingToClaim` (verified via `eth_call`) |
| `refundUnused` | `0x03119f2b…ba59` | 69264642 | 52,960 |

**Final state:** `Settled` | escrow=0 | employer net 0 (paid 3, refunded 3) | worker unchanged  
**Result: PASS**

---

## State invariants verified across all flows

- `totalEscrow` returned to its pre-test value after all flows completed.
- No shift escrow increased after creation.
- `owed <= escrow` held throughout.
- Worker claimed exactly once (Flow 1); double-claim not attempted (covered by unit tests T11/U26).
- Terminal states (`Settled`, `Cancelled`) reached in every flow.

---

## Future work

To validate the live contract at `0x39845…41a6` against real Arc USDC:
1. Fund two testnet wallets (employer, worker) via the Arc Testnet faucet.
2. Use `cast send` or a wallet-connected script to call `approve`, `createShift`, etc. directly on the live contract.
3. Confirm `isBlocklisted` precompile is satisfied by the real chain's runtime.

Machine-readable results: `testnet-e2e.json`

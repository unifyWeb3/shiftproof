# ShiftProof — Live Arc Testnet E2E Checklist

**Purpose:** prove the deployed contract at `0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6` works with **real Arc Testnet USDC** and **two separate wallets**. This is the live test that the fork-based run in `TESTNET-E2E.md` does not cover.

**Status:** not yet run. This checklist is the acceptance procedure for that gap.

**Network:** Arc Testnet, chain ID `5042002`. Testnet USDC has no real-world value.
**Contract:** `0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6`
**USDC:** `0x3600000000000000000000000000000000000000` (6 decimals for the ERC-20 interface; 18 decimals for gas).

## 1. Preconditions

| # | Check | Expected | Evidence |
|---:|---|---|---|
| 1 | Two disposable wallets, employer and worker, are separate addresses | Different addresses; neither is the deployer | Screenshot of both addresses |
| 2 | Both wallets are on Arc Testnet | Chain ID `5042002` in Rabby | Wallet network screenshot |
| 3 | Both wallets have testnet USDC for gas and escrow | Employer: ≥ 20 USDC; worker: ≥ 1 USDC for gas | Balance screenshot |
| 4 | Faucet source | Arc Studio sidebar **Get test USDC**, or `https://faucet.circle.com` (testnet only) | Note the source used |
| 5 | App preview opens | `https://shiftproof-e51a9julz-oxunify.vercel.app` loads; footer says `Arc Testnet · chain 5042002 · testnet only` | Screenshot |
| 6 | Contract reads match | `nextShiftId` and `totalEscrow` match the explorer/read-only call | Record both values |
| 7 | Explorer reachable | Contract address opens on `explorer.testnet.arc.io` | Screenshot |
| 8 | Fresh state | Note the starting `nextShiftId` (call it `N`) and `totalEscrow` (call it `E`) | Record both |

**Stop if:** a wallet is on another chain, the app points at a different contract, the employer has less than the full escrow plus gas, or the explorer shows no code at the contract address. Do not “fix” this by sending more funds or switching wallets mid-run.

## 2. Flow A — happy path with a residual refund

Use **2 hours × 5 USDC/hour = 10 USDC escrow**, attest **1.5 hours = 7.5 USDC**, leaving **2.5 USDC** to refund.

| Step | Actor | Action | Expected UI | Expected on-chain state | Screenshot point |
|---:|---|---|---|---|---|
| A1 | Employer | Open `/employer`, enter worker address, rate `5`, max duration `2h` | Confirmation card shows `10.00 USDC` escrow and the worker address | No transaction yet | Amount + worker address before signing |
| A2 | Employer | Approve exact `10.00 USDC`, then `createShift` | Two wallet confirmations; success receipt with tx hash | `nextShiftId = N+1`; shift `N` status `Funded`; `totalEscrow = E+10`; employer −10 USDC | Success card and wallet balance after |
| A3 | Worker | Open `/worker` or `/shift/N`, connect worker wallet, `clockIn` | Button enabled only for the worker; status becomes `Active` | `startedAt > 0`; status `Active`; `totalEscrow` unchanged | Before/after status and tx hash |
| A4 | Worker | `clockOut` | Status becomes `Awaiting Attestation` | `endedAt >= startedAt`; status `AwaitingAttestation` | Receipt with both timestamps |
| A5 | Employer | `attest(N, 5400)` (1.5h) | Confirmation shows `7.50 USDC` owed; success | status `Attested`; `attestedSeconds = 5400`; `owed = 7.5`; `escrow = 10` | Attestation card with owed amount |
| A6 | Worker | `claim(N)` | Success; worker balance increases by `7.50 USDC` | status `Claimed`; `owed = 0`; `escrow = 2.5`; `totalEscrow = E+2.5` | Claim receipt and worker balance |
| A7 | Anyone | `refundUnused(N)` | Success; employer receives `2.50 USDC` | status `Settled`; `escrow = 0`; `owed = 0`; `totalEscrow = E` | Settled receipt and employer balance |
| A8 | Anyone | Refresh `/shift/N` | Read-only receipt still renders; no wallet needed | State matches A7 | Full receipt page |

**Flow A passes when:** all seven transactions succeed, the final state is `Settled`, `totalEscrow` returns to `E`, worker net +7.5, employer net −7.5 (plus gas), and the receipt matches the explorer.

## 3. Flow B — zero attestation and no claim

Use **1 hour × 3 USDC/hour = 3 USDC escrow**, attest **0 seconds**.

| Step | Actor | Action | Expected UI | Expected on-chain state | Screenshot point |
|---:|---|---|---|---|---|
| B1 | Employer | Create shift `N+1`: rate `3`, duration `1h` | Escrow `3.00 USDC` | status `Funded`; `totalEscrow = E+3` | Confirmation |
| B2 | Worker | `clockIn`, then `clockOut` | Status `Awaiting Attestation` | status `AwaitingAttestation` | Status history |
| B3 | Employer | `attest(N+1, 0)` | Owed `0.00 USDC`; success | status `Attested`; `owed = 0`; `escrow = 3` | Attestation with zero owed |
| B4 | Worker | Attempt `claim(N+1)` | UI blocks or wallet reverts with `NothingToClaim` | No state change; no USDC moved | Error message |
| B5 | Anyone | `refundUnused(N+1)` | Success; employer receives `3.00 USDC` | status `Settled`; `escrow = 0`; `totalEscrow = E` | Settled receipt |

**Flow B passes when:** claim is rejected without a transfer, refund returns the full 3 USDC, and the shift ends `Settled`.

## 4. Flow C — cancel before clock-in

Use **1 hour × 4 USDC/hour = 4 USDC escrow**.

| Step | Actor | Action | Expected UI | Expected on-chain state | Screenshot point |
|---:|---|---|---|---|---|
| C1 | Employer | Create shift `N+2`: rate `4`, duration `1h` | Escrow `4.00 USDC` | status `Funded`; `totalEscrow = E+4` | Confirmation |
| C2 | Employer | `cancel(N+2)` before any clock-in | Success; employer receives `4.00 USDC` | status `Cancelled`; `escrow = 0`; `totalEscrow = E` | Cancelled receipt |
| C3 | Worker | Attempt `clockIn(N+2)` | UI/wallet rejects with `InvalidStatus` | No state change | Error message |

**Flow C passes when:** cancel refunds the full escrow and a cancelled shift cannot be clocked in.

## 5. Negative checks

| # | Check | Expected | Screenshot point |
|---:|---|---|---|
| N1 | Wrong network: switch employer wallet to Ethereum | App shows the wrong-chain banner and offers Arc Testnet; write buttons disabled | Banner + disabled button |
| N2 | Wrong role: employer tries `claim`, worker tries `attest` | UI explains the required role before signing; if forced, the contract reverts `NotEmployer`/`NotWorker` | Role error |
| N3 | Insufficient gas: use a wallet with testnet USDC below the gas cost | App or wallet reports insufficient gas; no transaction is sent | Error message |
| N4 | Unknown shift ID: open `/shift/999999` | Read-only “not found” state; no crash | Not-found page |
| N5 | Refresh/reopen `/shift/N` | Receipt persists from chain data; localStorage is not required | Receipt after clearing localStorage |
| N6 | Mobile viewport (390 px) | Amounts, addresses, and buttons are readable; wallet connect works | Mobile screenshot |

## 6. Evidence to capture

For every write step, record:

- tx hash, block number, and explorer URL;
- before/after wallet balances (employer and worker);
- `getShift(id)` fields: `status`, `escrow`, `owed`, `attestedSeconds`, `startedAt`, `endedAt`;
- `nextShiftId` and `totalEscrow` before and after the whole run;
- desktop screenshots for A1–A8 and mobile screenshots for N6.

Suggested filenames:

```text
evidence/live-e2e/
  A1-create-confirm.png
  A2-create-success.png
  A3-clockin.png
  A4-clockout.png
  A5-attest.png
  A6-claim.png
  A7-refund.png
  A8-receipt.png
  B4-claim-rejected.png
  C2-cancel.png
  N1-wrong-network.png
  N6-mobile.png
  balances-before.json
  balances-after.json
  state-final.json
  txs.txt
```

`txs.txt` should contain one line per transaction: `flow,step,actor,txHash,block`. Do not include private keys, seed phrases, or `.env` values in any evidence file.

## 7. Pass/fail summary

| Item | Pass condition |
|---|---|
| Flow A | Happy path reaches `Settled`; worker receives 7.5; employer receives 2.5 back |
| Flow B | Zero attestation cannot be claimed; full 3 refunded; ends `Settled` |
| Flow C | Cancel before clock-in refunds 4; cancelled shift cannot start |
| Accounting | `totalEscrow` returns to `E`; no shift escrow increases after creation |
| Safety | Wrong network and wrong role are blocked with a clear message; no key is exposed |
| Evidence | Every write has a tx hash and a screenshot; state export matches the explorer |

Record the run date, commit, contract, starting `nextShiftId`, starting `totalEscrow`, and the final result. If any step fails, stop and record the exact error; do not retry with a different wallet or amount without noting the deviation.

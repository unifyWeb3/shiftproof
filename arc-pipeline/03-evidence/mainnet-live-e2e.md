# ShiftProof — Arc Mainnet Live Two-Wallet E2E (read-only verification)

**Verdict: VERIFIED**, with named disclosures. A complete live shift lifecycle ran on-chain between the employer wallet `0x3211d1419709682b81c53CC51cb63622E25488d3` and the worker wallet `0x01dBB77D003835Ea87385f36E921531DA8EffDbB` on contract `0x2A88dDe461280F5a3Ad959fd6997388409e766a9` (chain `5042`). Every step below is read from RPC; no transaction was sent and no key was used for this check. This is **not** an audit: employer attestation remains the trust anchor, and the deployed runtime still differs from the optimized frozen artifact (optimizer disabled, disclosed in `mainnet-deploy.md`).

- Scan time: `2026-10-31T12:11:54.413Z` at latest block `28,815,019`
- RPC: `https://rpc.mainnet.arc.io`
- Range swept: deployment block `28,736,878` (inclusive) → `28,815,019`
- Raw data: [mainnet-live-e2e.json](mainnet-live-e2e.json) (RPC sweep output: logs, txs, balances, state)

---

## 1. Every contract transaction in the range

Enumeration method: `eth_getLogs` for all logs emitted **by the contract** in the range (6 logs → 5 txs), plus the contract-creation tx. Every state-changing ShiftProof function emits an event (source-verified), so successful state-changing calls are covered by this sweep. Transactions that emit **no** event — e.g. reverted calls or `eth_call`s — cannot be enumerated this way; none were assumed, and any such tx would also change no state. A full block-by-block scan of ~27.8k blocks was **not** performed (this is not an indexer; the same caveat applies to the USDC sweep in §3).

| # | Tx | Block (time UTC) | Sender | Function | Status | Gas used |
|---|---|---|---|---|---|---|
| 1 | [`0x9b56fa49…36d98`](https://explorer.arc.io/tx/0x9b56fa49c2c78b78ac24c7f4f154d4825194c6939b05f4e8086a8d5e10336d98) | `28,736,878` (01:11:14) | `0x3211…88d3` | `constructor` (creation, `to: null`) | success | `2,455,856` |
| 2 | [`0xd0fee562…3c528`](https://explorer.arc.io/tx/0xd0fee562f840cc303a02f11a2fe771b3a8f4537650d32f07b7cb5e7dd073c528) | `28,746,088` (02:29:03) | `0x3211…88d3` | `createShift` | success | `219,216` |
| 3 | [`0x3938a944…18c73`](https://explorer.arc.io/tx/0x3938a9440e6c1afb6a3588b1fdf5ca9c89338d37f98ab34c967a8ddd33518c73) | `28,746,163` (02:29:41) | `0x01dB…fDbB` (worker) | `clockIn` | success | `36,582` |
| 4 | [`0x940951f1…50063`](https://explorer.arc.io/tx/0x940951f1e35dab64e13972ac6f980c9a478f064b2a55aedc230b7fc6efe50063) | `28,746,191` (02:29:55) | `0x01dB…fDbB` (worker) | `clockOut` | success | `36,748` |
| 5 | [`0xd4f47eb0…31cf`](https://explorer.arc.io/tx/0xd4f47eb026827032ff39323e49a5eb6996c259e324f15d992bd3931c51cb31cf) | `28,746,278` (02:30:39) | `0x3211…88d3` (employer) | `attest` | success | `64,933` |
| 6 | [`0x3e8011cf…055e6`](https://explorer.arc.io/tx/0x3e8011cfdaf40ca6510ba8f5cc3f060abdfffb68b4e3645eb886351476f055e6) | `28,746,333` (02:31:08) | `0x01dB…fDbB` (worker) | `claim` | success | `65,583` |

Full hashes are in [mainnet-live-e2e.json](mainnet-live-e2e.json). Six contract-emitted logs exist in the range; none other were found from this address.

## 2. Contract events decoded (frozen ABI)

| Tx | Event | Args |
|---|---|---|
| createShift tx | `ShiftCreated` | shiftId `1`, employer `0x3211…88d3`, worker `0x01dB…fDbB`, hourlyRate `150000` (0.15 USDC/hr), maxSeconds `3600`, escrow `150000` (0.15 USDC) |
| clockIn tx | `ClockedIn` | shiftId `1`, worker `0x01dB…fDbB`, at `1793413781` = `2026-10-31T02:29:41Z` |
| clockOut tx | `ClockedOut` | shiftId `1`, worker `0x01dB…fDbB`, at `1793413795` = `2026-10-31T02:29:55Z` |
| attest tx | `Attested` | shiftId `1`, employer `0x3211…88d3`, attestedSeconds `3600`, owed `150000` |
| claim tx | `Claimed` | shiftId `1`, worker `0x01dB…fDbB`, amount `150000` |
| claim tx | `Settled` | shiftId `1` |

Log indices per tx are in the JSON. `Attested` and `Claimed` events carry contract-derived seconds/amounts; they are the contract's own accounting, not independent proof of work.

## 3. USDC events involving contract / employer / worker

USDC ERC-20 interface: `0x3600000000000000000000000000000000000000` ([explorer](https://explorer.arc.io/address/0x3600000000000000000000000000000000000000)). Sweep: `eth_getLogs` on USDC with topic filters for `Transfer`/`Approval` where sender/recipient (or owner/spender) is the contract, employer, or worker. Two Transfer-side and one Approval-side hit in range:

| Tx | Event | From / owner | To / spender | Value (raw 6-dec) |
|---|---|---|---|---|
| [approve tx `0x1d58499b…9e719`](https://explorer.arc.io/tx/0x1d58499b9f9c88d59b826fd37c59a1ca63fe39f99361b1fb252606439309e719) | `Approval` | employer `0x3211…88d3` | ShiftProof `0x2A88…66a9` | `150000` (0.15 USDC, exact) |
| [createShift tx `0xd0fee562…3c528`](https://explorer.arc.io/tx/0xd0fee562f840cc303a02f11a2fe771b3a8f4537650d32f07b7cb5e7dd073c528) | `Transfer` | employer `0x3211…88d3` | ShiftProof `0x2A88…66a9` | `150000` |
| [claim tx `0x3e8011cf…055e6`](https://explorer.arc.io/tx/0x3e8011cfdaf40ca6510ba8f5cc3f060abdfffb68b4e3645eb886351476f055e6) | `Transfer` | ShiftProof `0x2A88…66a9` | worker `0x01dB…fDbB` | `150000` |

### Employer approve transaction details

| Field | Value | Status |
|---|---|---|
| Hash | `0x1d58499b9f9c88d59b826fd37c59a1ca63fe39f99361b1fb252606439309e719` | **VERIFIED** |
| Block / time UTC | `28,746,059` / `2026-10-31T02:28:48Z` | **VERIFIED** |
| Sender | `0x3211d1419709682b81c53cc51cb63622E25488d3` (employer) | **VERIFIED** |
| To | USDC `0x3600…0000` | **VERIFIED** |
| Function | `approve` (selector `0x095ea7b3`; decoded args match the `Approval` log: spender = ShiftProof, amount = `150000`) | **VERIFIED** |
| Status / gas | success / `55,438` | **VERIFIED** |
| Link | <https://explorer.arc.io/tx/0x1d58499b9f9c88d59b826fd37c59a1ca63fe39f99361b1fb252606439309e719> | — |

Observed but out of scope for ShiftProof: each USDC-touching tx (createShift, claim) carries one sibling `Transfer` log from the Arc system emitter `0xfffffffffffffffffffffffffffffffffffffffe` alongside the `0x3600…0000` Transfer. It is not ShiftProof-related and was not semantically decoded — listed only so nothing on those receipts is hidden. `VERIFIED` existence; meaning `UNVERIFIED`.

## 4. USDC balances before/after (6-decimal `balanceOf` at anchored blocks)

Derivation: balances were read with `eth_call` at specific historical blocks; native gas is USDC on Arc, so wallet balance deltas include escrow flows **and** per-tx gas fees. Receipt `effectiveGasPrice` was the same for every lifecycle tx (equivalent to `20.001` gwei), so fee math closes exactly (differences within 1 micro-USDC of display rounding).

Per-tx native gas fees (`gasUsed × effectiveGasPrice`), 18-decimal native units ≡ USDC balance:

| Tx | gas used | Fee (native, 18-dec) |
|---|---|---|
| approve | `55,438` | `0.001108815438` |
| createShift | `219,216` | `0.004384539216` |
| clockIn | `36,582` | `0.000731676582` |
| clockOut | `36,748` | `0.000734996748` |
| attest | `64,933` | `0.001298724933` |
| claim | `65,583` | `0.001311725583` |

Balance ledger, block-anchored and reconciled (all **VERIFIED** — each row is an RPC read; arithmetic closes to display rounding):

| Address | Point | Block | Balance | Explained by |
|---|---|---|---|---|
| Employer | before approve | `28,746,058` | `0.402131` | start anchor, derivable |
| Employer | after approve | `28,746,059` | `0.401022` | −approve fee `0.001108815438` |
| Employer | after create | `28,746,088` | `0.246638` | −escrow `0.15`, −create fee `0.004384539216` |
| Employer | after attest | `28,746,278` | `0.245339` | −attest fee `0.001298724933` |
| Contract | before create | `28,746,087` | `0` | untouched |
| Contract | after create / before claim | `28,746,332` | `0.15` | escrow received `150000` raw |
| Contract | after claim | `28,746,333` | `0` | `150000` paid to worker |
| Worker | before clockIn | `28,746,162` | `0.05` | start anchor, derivable |
| Worker | after clockIn | `28,746,163` | `0.049268` | −clockIn fee `0.000731676582` |
| Worker | before claim | `28,746,332` | `0.048533` | −clockOut fee `0.000734996748` |
| Worker | after claim | `28,746,333` | `0.197221` | +claim `0.15`, −claim fee `0.001311725583` |

Scan-block balances (block `28,815,019`): employer `0.245339`, worker `0.197221`, contract `0` — unchanged after claim, consistent with no further events.

## 5. Contract state at scan block

| Read | Value |
|---|---|
| `nextShiftId()` | `2` → shift #1 is the only shift ever created |
| `totalEscrow()` | `0` |
| `getShift(1)` | employer `0x3211…88d3`, worker `0x01dB…fDbB`, rate `150000`, maxSeconds `3600`, attestedSeconds `3600`, escrow `0`, owed `0`, status `6` (`Settled`), createdAt `1793413743` = `2026-10-31T02:29:03Z` |

## 6. Lifecycle proof

| Step | Typing function | On-chain evidence | Status |
|---|---|---|---|
| Approve | `approve` (USDC) | §3 approval row, tx `0x1d58499b…9e719` | **VERIFIED** |
| Create | `createShift` | `ShiftCreated(1)`, escrow `150000` moved employer→contract | **VERIFIED** |
| Clock-in | `clockIn` (worker) | `ClockedIn(1, at 02:29:41Z)` | **VERIFIED** |
| Clock-out | `clockOut` (worker) | `ClockedOut(1, at 02:29:55Z)` | **VERIFIED** |
| Attest | `attest` (employer) | `Attested(1, 3600s, owed 150000)` | **VERIFIED** |
| Claim | `claim` (worker) | `Claimed(1, 150000)` + USDC transfer out | **VERIFIED** |
| Settle | (emitted by claim) | `Settled(1)`; `getShift(1)` status 6, escrow 0 | **VERIFIED** |
| Residual refund | `refundUnused` | no `Refunded` event in range — **MISSING** (not required: claim paid the full owed) | `MISSING` |
| Cancel | `cancel` | no `Cancelled` event in range — **MISSING** (not exercised) | `MISSING` |
| Multi-shift | — | `nextShiftId()=2`: no other shift exists | **VERIFIED** (absence) |

## 7. What this does and does not establish

**Establishes:** a complete funded/clocked/attested/claimed/settled lifecycle with real USDC on Arc mainnet, matching the deployed V1 semantics, with balances consistent at block anchors.

**Does not establish:** that the employer/worker transactions constitute independent proof of work — attestation is the trust anchor by design; wallet identity/ownership beyond the observed signatures (key control of both wallets is known to the builder, not externally verifiable here); UX behavior above what receipts/logs show; pass-time gas accounting beyond anchors; anything about TXs outside the swept range or reverted/no-log calls (for which the sweep is silent by method).

**Not done here:** no transaction was sent, no key was used, no contract change, no refund/cancel exercised. Final-state contract/side-of-record unchanged since block `28,746,333` except the shift state already represented above.

## 8. Constraint compliance

- Read-only: `eth_getLogs`, `eth_getTransactionByHash`, `eth_getTransactionReceipt`, `eth_call`, `eth_getBlockByNumber` only. No key. **VERIFIED** by method; sweep scoped to stated range.
- USDC labels: contract README claims the *native* Arc token is 18-dec and the ERC-20 interface is 6-dec; interface `decimals()` reads `6` on `0x3600…0000`. `VERIFIED` for the interface; underlying representations `UNVERIFIED`.
- Contract capabilities verified live for shift #1 only; behavior on other inputs is contract-source/Studio-run claims, not live observations.

---

**Live links:** [contract](https://explorer.arc.io/address/0x2A88dDe461280F5a3Ad959fd6997388409e766a9) · [USDC](https://explorer.arc.io/address/0x3600000000000000000000000000000000000000) · [Shift #1 app view](https://shiftproof-phi.vercel.app/shift/1)

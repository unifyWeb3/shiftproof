# Read this before citing the E2E result

`TESTNET-E2E.md` and `testnet-e2e.json` describe a **fork-lane** test, not a live
Arc Testnet wallet run.

- `testedViaFork` is `true` in `testnet-e2e.json`.
- The tested contract was the fresh fork deployment
  `0x535b3d7a252fa034ed71f0c53ec0c6f784cb64e1`, using MockUSDC
  `0x522b3294e6d06aa25ad0f1b8891242e335d3b459`.
- The live testnet contract is `0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6`.
  Its `nextShiftId` remains `1`; no live write transaction has been sent.
- The fork transaction hashes and block numbers are anvil-local. They are **not**
  Arc Testnet transaction hashes. Do not link them as live evidence.
- The fork used impersonated addresses `0x1111…`, `0x2222…`, `0x3333…`; no private
  keys were held. These are not funded testnet wallets.
- The fork could not call the real Arc USDC because its chain-specific blocklist
  precompile is absent in vanilla anvil. This is an infrastructure limitation,
  not a contract-test pass on live USDC.

The three fork flows did pass: happy path (attest 1.5h, claim 7.5, refund 2.5),
cancel-before-clock-in, and zero-attestation full refund. Treat that as
contract-logic evidence only. Live-USDC E2E with two real Rabby accounts is still
**UNVERIFIED** and is a Phase 2 task.

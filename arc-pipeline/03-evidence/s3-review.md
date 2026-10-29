# S3 review — Arc Testnet deployment

**Run:** `arc-studio run --session shiftproof --prompt-file phase1/prompts/s3-testnet-deploy.txt --output json`
**Result:** `03-evidence/s3-run.json`; status `completed`; CLI exit `0`; usage 12%.
**Files changed:** `AGENTS.md`, `README.md`, `contracts/contract-metadata/ShiftProof.json`, `deployments.json`.
**Contract source:** unchanged from the reviewed S1 source (`80c1f314…`).

## Independently checked from public Arc Testnet RPC

Raw evidence: `03-evidence/s3-onchain-verification.json`.

| Field | Result |
|---|---|
| Chain ID | `0x4cef52` = `5042002` (Arc Testnet) |
| Contract | `0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6` |
| Deployment tx | `0x89b616d394bd6b834901e24d3651fd05bdcbe4d84dae64befeb5fc5f40dcfd52` |
| Receipt status | `0x1` (success) |
| Block | `69263663` |
| Code | 5,990 bytes, non-empty |
| `usdc()` | `0x3600000000000000000000000000000000000000` |
| `nextShiftId()` | `1` |
| `totalEscrow()` | `0` |
| `MAX_HOURLY_RATE()` | `1000000000` (1,000 USDC in 6-decimal units) |
| `MAX_SHIFT_SECONDS()` | `86400` |
| `MAX_ESCROW()` | `10000000000` (10,000 USDC in 6-decimal units) |

The transaction is an account-abstraction transaction: `tx.to` is the EntryPoint
`0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789`, and the receipt has no top-level
`contractAddress`. Log 1 from `0xa3039a54856ed74b5aec999eef3fc954ab010cf6` has the
ShiftProof address as an indexed topic, which corroborates the deployment. The
transaction sender is the public testnet platform wallet `0xe6d84f24fc96ac684c99eb85005305a509b01be3`;
no user-held mainnet key was used.

The deployed bytecode matches the compiled artifact except for the five bytes where
the 20-byte immutable USDC address is embedded (`0x36` at positions 395, 1474, 1932,
2394, 4141; the remaining address bytes are zero). Exact local/on-chain bytecode
comparison is recorded in this review and can be reproduced from
`phase1/artifacts/contracts/out/ShiftProof.sol/ShiftProof.json` and
`03-evidence/s3-onchain-verification.json`.

## Verification and gaps

- Source verification on Arc Testnet Explorer is **not available** for this
  deployment: `deployments.json` records `"verified": false`. The public
  Blockscout API (`/api/v2/smart-contracts/<address>`) returned bytecode but no
  `source_code`, `abi`, or `is_verified` field; the legacy getsourcecode endpoint
  returned only the address. Raw response: `explorer-verification-attempt.json`
  and `explorer-contract.json`. Do not claim verified source.
- `deployments.json` does not yet include the deployment block (`69263663`); the
  frontend config needs it. Add it in the next Studio turn.
- The public RPC and explorer links are testnet-only. No mainnet transaction,
  deployment, key, or spend occurred.

## Next step

Run a testnet E2E flow against the deployed contract with disposable testnet
wallets, then build the frontend against the deployed address.

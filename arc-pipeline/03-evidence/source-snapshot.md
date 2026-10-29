# Source snapshot (Phase 1)

The committed app source is in `/root/arc/app/`. It was assembled from the current
Studio pull after S6; the `src/` tree is byte-identical to
`arc-pipeline/phase1/studio-current2/src/`.

## Contract hashes (SHA-256)

| File | SHA-256 |
|---|---|
| `app/contracts/ShiftProof.sol` | `80c1f314b54d4579a09923bbbafdf808d52b9f84b003928fe3e6abb6a3a9f5c5` |
| `app/contracts/test/ShiftProof.t.sol` | `aa236c4fead990df30d5c4f95a5692f00a17c57961390baaa94675bb3699affb` |
| `app/contracts/test/MockUSDC.sol` | `c5c5d654a01e3b98bef9bf8fdd31578f166066b3f5c336c6866f58cadad7d3e7` |
| `app/contracts/script/Deploy.s.sol` | `32af31147773fbd07b5f43a86304ad94a76c23c621c6e9e6e35b6b2b164e7001` |
| `app/contracts/contract-metadata/ShiftProof.json` | `4457f0fd9dd8dca11bb7c6e797c0ebe306ec9bd295d77f9f76a7c648eba27446` |
| `app/contracts/out/ShiftProof.sol/ShiftProof.json` | `c298d882e2db80a014a3c89e36076fe741d0f11f166c107994915340cab62dcb` |

The contract source hash is unchanged from the reviewed S1/S2 source; S2 fixed only
the test setup, and S3–S6 did not touch the contract.

## Deployment

`app/deployments.json` is the app's source of truth: Arc Testnet `5042002`,
`0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6`, deployment block `69263663`,
USDC `0x3600000000000000000000000000000000000000`, `verified: false`.

## Build note

`README.md` says `bun run build`, but the scaffold `package.json` has no `build`
script. The verified command used in Studio was `bunx vite build`; add a `build`
script or correct the README in Phase 2. No node_modules, dist, or lib directory is
committed.

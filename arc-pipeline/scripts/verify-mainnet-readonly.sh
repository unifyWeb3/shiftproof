#!/usr/bin/env bash
# ShiftProof V1 - read-only post-deploy verification for Arc Mainnet (chain 5042).
#
# This script performs RPC reads only. It has no signing path, no private-key
# flag, no wallet, and no transaction broadcast. It is safe to run against a
# deployed contract, but it is NOT a substitute for a human explorer check.
#
# Requirements:
#   - Arc Foundry `arc-cast` on PATH (or set CAST_BIN)
#   - python3 (standard library only)
#
# Usage:
#   ./verify-mainnet-readonly.sh <contract> [expectedNextShiftId] [expectedTotalEscrow]
#
# Examples:
#   ./verify-mainnet-readonly.sh 0x... 1 0     # immediately after deploy
#   ./verify-mainnet-readonly.sh 0x... 4 0     # after shifts A/B/C
#   ./verify-mainnet-readonly.sh 0x... 5 0     # after optional S0 + A/B/C
#
# Environment overrides:
#   ARC_MAINNET_RPC   default https://rpc.mainnet.arc.io
#   CAST_BIN          default arc-cast
#   SHIFTPROOF_ARTIFACT default <repo>/app/contracts/out/ShiftProof.sol/ShiftProof.json
#   USDC_ADDRESS      default 0x3600000000000000000000000000000000000000
#
# Exit code 0 = all checks passed; 1 = one or more checks failed.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

RPC="${ARC_MAINNET_RPC:-https://rpc.mainnet.arc.io}"
CAST_BIN="${CAST_BIN:-arc-cast}"
ARTIFACT="${SHIFTPROOF_ARTIFACT:-$REPO_ROOT/app/contracts/out/ShiftProof.sol/ShiftProof.json}"
USDC="${USDC_ADDRESS:-0x3600000000000000000000000000000000000000}"

CONTRACT="${1:-}"
EXPECTED_NEXT="${2:-1}"
EXPECTED_TOTAL="${3:-0}"

EXPECTED_CHAIN_ID="5042"
EXPECTED_RUNTIME_BYTES="5990"
EXPECTED_RUNTIME_HASH="0x843ef44664f6eb7bbbe95c213d6fd60b88d912b3810d087981ab69a94b90b1e5"
IMMUTABLE_OFFSETS="395 1474 1932 2394 4141"

fail=0
pass() { printf 'PASS  %s\n' "$*"; }
warn() { printf 'WARN  %s\n' "$*"; }
bad()  { printf 'FAIL  %s\n' "$*"; fail=1; }

if [[ -z "$CONTRACT" ]]; then
  printf 'Usage: %s <contract> [expectedNextShiftId] [expectedTotalEscrow]\n' "$0" >&2
  exit 2
fi

if ! command -v "$CAST_BIN" >/dev/null 2>&1; then
  printf 'ERROR: %s not found on PATH. Install Arc Foundry or set CAST_BIN.\n' "$CAST_BIN" >&2
  exit 2
fi

if ! command -v python3 >/dev/null 2>&1; then
  printf 'ERROR: python3 not found on PATH.\n' >&2
  exit 2
fi

if [[ ! -f "$ARTIFACT" ]]; then
  printf 'ERROR: artifact not found at %s\n' "$ARTIFACT" >&2
  exit 2
fi

printf 'ShiftProof read-only verification\n'
printf '  RPC:      %s\n' "$RPC"
printf '  Contract: %s\n' "$CONTRACT"
printf '  USDC:     %s\n' "$USDC"
printf '  Artifact: %s\n\n' "$ARTIFACT"

# ---------------------------------------------------------------------------
# 1. Chain ID
# ---------------------------------------------------------------------------
chain_id="$("$CAST_BIN" chain-id --rpc-url "$RPC" 2>/dev/null || true)"
chain_id="${chain_id//[[:space:]]/}"
if [[ "$chain_id" == "$EXPECTED_CHAIN_ID" ]]; then
  pass "chain ID is $EXPECTED_CHAIN_ID (Arc Mainnet)"
else
  bad "chain ID is '${chain_id:-<empty>}', expected $EXPECTED_CHAIN_ID"
fi

# ---------------------------------------------------------------------------
# 2. Code presence and size
# ---------------------------------------------------------------------------
code="$("$CAST_BIN" code "$CONTRACT" --rpc-url "$RPC" 2>/dev/null || true)"
code="${code//[[:space:]]/}"

if [[ -z "$code" || "$code" == "0x" ]]; then
  bad "no bytecode at $CONTRACT"
  code_bytes=0
else
  code_bytes=$(( (${#code} - 2) / 2 ))
  if [[ "$code_bytes" == "$EXPECTED_RUNTIME_BYTES" ]]; then
    pass "runtime code size is $code_bytes bytes"
  else
    bad "runtime code size is $code_bytes bytes, expected $EXPECTED_RUNTIME_BYTES"
  fi
fi

# ---------------------------------------------------------------------------
# 3. Immutable USDC and public reads
# ---------------------------------------------------------------------------
call() {
  "$CAST_BIN" call "$1" "$2" --rpc-url "$RPC" 2>/dev/null | tr -d '[:space:]'
}

usdc_onchain="$(call "$CONTRACT" 'usdc()(address)' || true)"
if [[ "${usdc_onchain,,}" == "${USDC,,}" ]]; then
  pass "usdc() is $USDC"
else
  bad "usdc() is '${usdc_onchain:-<empty>}', expected $USDC"
fi

next_id="$(call "$CONTRACT" 'nextShiftId()(uint256)' || true)"
next_id="${next_id%% *}"
if [[ "$next_id" == "$EXPECTED_NEXT" ]]; then
  pass "nextShiftId() is $next_id"
else
  bad "nextShiftId() is '${next_id:-<empty>}', expected $EXPECTED_NEXT"
fi

total_escrow="$(call "$CONTRACT" 'totalEscrow()(uint256)' || true)"
total_escrow="${total_escrow%% *}"
if [[ "$total_escrow" == "$EXPECTED_TOTAL" ]]; then
  pass "totalEscrow() is $total_escrow (6-decimal base units)"
else
  bad "totalEscrow() is '${total_escrow:-<empty>}', expected $EXPECTED_TOTAL"
fi

usdc_decimals="$(call "$USDC" 'decimals()(uint8)' || true)"
if [[ "$usdc_decimals" == "6" ]]; then
  pass "USDC decimals() is 6"
else
  bad "USDC decimals() is '${usdc_decimals:-<empty>}', expected 6"
fi

usdc_symbol="$(call "$USDC" 'symbol()(string)' || true)"
usdc_symbol="${usdc_symbol//\"/}"
if [[ "$usdc_symbol" == "USDC" ]]; then
  pass "USDC symbol() is USDC"
else
  warn "USDC symbol() is '${usdc_symbol:-<empty>}', expected USDC (informational)"
fi

# Caps are informational; they should match the frozen source.
max_hourly="$(call "$CONTRACT" 'MAX_HOURLY_RATE()(uint256)' || true)"
max_seconds="$(call "$CONTRACT" 'MAX_SHIFT_SECONDS()(uint32)' || true)"
max_escrow="$(call "$CONTRACT" 'MAX_ESCROW()(uint256)' || true)"
printf 'INFO  MAX_HOURLY_RATE=%s MAX_SHIFT_SECONDS=%s MAX_ESCROW=%s\n' \
  "${max_hourly:-<empty>}" "${max_seconds:-<empty>}" "${max_escrow:-<empty>}"

# ---------------------------------------------------------------------------
# 4. Bytecode hash
# ---------------------------------------------------------------------------
if [[ "$code_bytes" != "0" ]]; then
  runtime_hash="$("$CAST_BIN" keccak "$code" 2>/dev/null | tr -d '[:space:]' || true)"
  if [[ "${runtime_hash,,}" == "${EXPECTED_RUNTIME_HASH,,}" ]]; then
    pass "runtime keccak256 is $EXPECTED_RUNTIME_HASH"
  else
    bad "runtime keccak256 is '${runtime_hash:-<empty>}', expected $EXPECTED_RUNTIME_HASH"
  fi
fi

# ---------------------------------------------------------------------------
# 5. Exact bytecode comparison against the frozen artifact, with immutable
#    USDC bytes patched in. This is stronger than the hash alone: it shows
#    exactly which bytes differ, if any.
# ---------------------------------------------------------------------------
if [[ "$code_bytes" != "0" ]]; then
  if python3 - "$ARTIFACT" "$code" "$USDC" "$IMMUTABLE_OFFSETS" <<'PY'
import json
import sys

artifact_path, onchain_hex, usdc_hex, offsets_raw = sys.argv[1:5]
offsets = [int(x) for x in offsets_raw.split()]

with open(artifact_path, "r", encoding="utf-8") as fh:
    artifact = json.load(fh)

artifact_hex = artifact["deployedBytecode"]["object"]
artifact_bytes = bytes.fromhex(artifact_hex[2:])
onchain_bytes = bytes.fromhex(onchain_hex[2:])
usdc_bytes = bytes.fromhex(usdc_hex[2:])

if len(usdc_bytes) != 20:
    print(f"FAIL  USDC address is {len(usdc_bytes)} bytes, expected 20")
    sys.exit(1)

expected = bytearray(artifact_bytes)
for offset in offsets:
    if offset + 20 > len(expected):
        print(f"FAIL  immutable offset {offset} is outside the runtime code")
        sys.exit(1)
    if expected[offset:offset + 20] != b"\x00" * 20:
        print(f"FAIL  artifact immutable region at {offset} is not zero-filled")
        sys.exit(1)
    expected[offset:offset + 20] = usdc_bytes

if onchain_bytes == bytes(expected):
    print(f"PASS  on-chain code matches the frozen artifact with USDC immutable bytes at {offsets}")
else:
    if len(onchain_bytes) != len(expected):
        print(f"FAIL  code length {len(onchain_bytes)} != expected {len(expected)}")
    diffs = [i for i, (a, b) in enumerate(zip(onchain_bytes, expected)) if a != b]
    print(f"FAIL  on-chain code differs from the frozen artifact at {len(diffs)} byte(s)")
    for i in diffs[:20]:
        print(f"      offset {i}: on-chain 0x{onchain_bytes[i]:02x}, expected 0x{expected[i]:02x}")
    if len(diffs) > 20:
        print(f"      ... {len(diffs) - 20} more")
    sys.exit(1)
PY
  then
    pass "exact bytecode comparison"
  else
    bad "exact bytecode comparison"
  fi
fi

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
printf '\n'
if [[ "$fail" == "0" ]]; then
  printf 'RESULT: PASS - read-only checks passed. This does NOT verify source code on the explorer.\n'
  exit 0
else
  printf 'RESULT: FAIL - stop. Do not fund or use this contract until the mismatch is explained.\n'
  exit 1
fi

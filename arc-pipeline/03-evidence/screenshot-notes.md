# Screenshot notes — Phase 1

No browser screenshots were captured in this CLI-only environment. The Studio
preview was not used to take screenshots, so there is no image evidence to attach.
The routes below are built and were production-built; a human should capture these
after a live wallet run.

| # | Route | State to capture | What the screenshot must prove |
|---|---|---|---|
| 1 | `/` | Home, live stats | Testnet badge, contract link, shift count/escrow read from chain |
| 2 | `/employer` | Create form + confirmation | Exact approval amount, worker address, rate, max duration, computed escrow |
| 3 | `/employer` | Created shift row | New shift ID, Funded status, local record, no manual-ID workaround |
| 4 | `/worker` | Clock-in/out and claim | Connected worker is the assigned address; clock state and claim state |
| 5 | `/shift/:id` | Settled receipt | Employer/worker, amounts, status, UTC/local timestamps, tx links |
| 6 | `/proof` | Submission page | Studio project URL, contract, deploy tx, honest verification/E2E status |
| 7 | `/help` | Disclosures | Attestation-not-verification, no fees, no dispute, no PII |
| 8 | Any write screen | Wrong-network banner | Writes disabled; switch button visible; no auto-switch |
| 9 | Any write screen | Wrong-role message | Employer cannot claim; worker cannot attest; UI explains |
| 10 | Mobile width | Home or receipt | Responsive layout, readable addresses, no clipped amounts |

Rules for the capture:
- Use Arc Testnet only, with two distinct disposable wallets.
- Use the live contract `0x39845ad25394ec0a6c15ebc5d8968d9c70bb41a6`.
- Do not put names, emails, phone numbers, or other PII in the app or screenshots.
- Do not use fork tx hashes in the screenshots. Only live testnet hashes count.
- Capture the full page including the footer contract address/chain ID where useful.

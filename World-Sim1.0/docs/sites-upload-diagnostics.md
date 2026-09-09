# Sites upload diagnostics — 2026-09-09

Project: `appgprj_6a9fe8b3c2e48191905624ce0797cba3`
Public site: https://world-sim.zhangshilin447.chatgpt.site

The production site was not redeployed during these tests.
**Versions 2 and 3 are incomplete diagnostic packages: never deploy them.**

| Package | Compressed bytes | Duration | Result |
| --- | ---: | ---: | --- |
| HTML, CSS, JS | 19,587 | 17.953 s | Saved as version 2; 11 files |
| Above plus PDF and 12 MP4s | 21,503,863 | 19.876 s | Saved as version 3; 24 files |
| Complete website | 103,674,311 | 60.713 s | Serialization error; no version saved |

Error: `failed to serialize JavaScript value: expected value at line 1 column 1`.
The medium and complete tests used separate empty source commits to avoid
same-commit version reuse. All source file contents were unchanged.
An earlier medium test reused the small package's version ID and archive hash;
that response was excluded from the comparison.

Source commits:
- Small: `d969b611ff5f9f8a8c096f1e2fc9e3b4fece2bb4`
- Medium: `273704d20ce7f85233c602e9de0185ead209e803`
- Complete: `12d379e0527d8ee7215bfdb482bbab7ab4170c73`

The complete source remains in `/tmp/world-sim-sites-upload` and on the Sites
remote main branch. Temporary paths may disappear after reboot.
Before a future production deployment, save and verify a complete archive with
283 files; do not select the latest saved diagnostic version automatically.

Interpretation: size-dependent upload/processing timeout is the leading
hypothesis, supported by approximately 60-second failure versus 18–20-second
successes. A fixed byte limit, a specific asset issue, or an upstream response
handling bug is not established or fully excluded. Prior successful version 1
contained 105,922,560 bytes in its server-stored archive, so a strict size limit
cannot be inferred solely from current failures.

Local desktop logs found under `~/.local/state/codex/logs` were dated September 8;
no matching save/upload error details were found. `~/.codex/log` only contained
an older login log. No raw HTTP status, request ID, or server upload log was
available, so the exact timeout layer remains unknown.

## Complete optimized version saved

Version 4 is a complete production candidate, unlike diagnostic versions 2 and 3.
Source: `d47070821a78dfbd752fcac5977dc51a2c81cf6f`.
Archive: 31,811,491 compressed bytes; 212 files including hosting metadata.
All 98 referenced videos retained, H.264 CRF 28; dimensions, frame rates, frame
counts and durations verified. 71 unused assets excluded only from build output.
First save attempt failed; second succeeded, indicating a transient component
as well as size-sensitive behavior. Original source assets remain untouched.
Future production builds: `python3 scripts/build-site.py --compress-videos`.

## Subsequent local cleanup

Unused assets and source archives were moved out of the project on September 9,
2026; see `README.md` for the backup location. The architecture source PDF is
retained for editing. The 211 website files, including all 98 referenced videos,
are unchanged. The counts above describe the earlier upload tests.

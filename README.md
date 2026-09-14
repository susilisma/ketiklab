# maintenance-log

Reports and the findings ledger written by the daily KetikLab maintenance routine
(a Claude Code cloud routine that audits the site, fixes verified problems, tests
and deploys). This branch holds no code and is excluded from Build check.

- `reports/YYYY-MM-DD.md` — one report per run, in Chinese
- `ledger.json` — every finding ever handled, so a run never re-reports or
  re-fixes an old item: `{"items": [{"fingerprint", "title", "priority",
  "status": "fixed|refuted|deferred|needs-owner", "commit", "reason", "date"}]}`

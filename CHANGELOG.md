# Changelog

## 3.2.0 — 2026-09-26

### Added
- Synthetic Credit Risk Model Lab with executable Python CI.
- Formal model-development ADRs covering data boundaries, grain, split discipline, baseline choice and fail-closed governance.
- Expanded Playwright E2E coverage for deep links, SQL interactions and mobile overflow.

### Changed
- Release version is now tracked explicitly in `VERSION` and `package.json`.
- Browser reliability is treated as a release gate alongside unit tests and build checks.

### Limitations
- The Risk Model Lab is synthetic and educational; it is not a bank, bureau, IFRS 9 or regulatory model.


## 2026-09-26 — clean-room risk research expansion

### Added
- Standalone research module for synthetic IFRS 9 ECL modeling.
- Standalone research module for independent credit-risk model validation.
- Python GitHub Actions CI covering both modules.
- Tested reference-result files and architecture diagrams.
- Repository-wide public-data/confidentiality boundary.

### Changed
- Renamed the recruiter-facing synthetic credit case study to **Credit Risk Lab** to avoid unnecessary employer-brand association.
- Updated the technical reviewer path to lead with credit-risk modeling, validation, and SQL engineering.

### Validation evidence
- IFRS 9 module: **7 regression tests passed**.
- Model Validation module: **4 core regression tests passed**.
- Reference validation verdict: **PASS WITH LIMITATIONS**, driven by calibration and observed-vs-expected evidence rather than hidden behind the acceptable ranking metric.

This file records material portfolio, data-engineering, reliability, and bug-fix changes. Small copy edits and purely cosmetic adjustments are omitted.

## 2026-09-26

### Fixed

- **iScore Credit Lab runtime initialization** — fixed a browser crash caused by iterating panel collections with the single-element `$()` selector helper instead of the collection `$$()` helper. The failure previously surfaced as the misleading message “Dashboard data could not load.” A regression test now blocks the same selector mistake from deploying again. Final fix: PR #5.
- **Suez Canal Bank dashboard KPI context** — aligned point-in-time KPIs, prior-year comparisons, and ratio metrics to one coherent selected-year context instead of mixing cumulative and single-year logic.
- **Suez Canal Bank chart containment** — constrained dashboard chart artwork to its visual containers to prevent overflow outside Power BI-style panels.

### Changed

- **iScore became web-first** — code and saved results are now inspectable directly in the browser instead of pushing visitors toward project downloads. Web-first portfolio changes were merged in PR #2.
- **Credit Lab SQL was hardened** — the report queries now make data grain explicit, deduplicate before one-to-many joins, pre-aggregate where required, and document anti-fan-out controls.
- **Credit Risk Management demo was aligned to its real schema** — the browser SQL example now uses the project’s actual Customers, Accounts, Loans, Payments, Payment_Schedule, and Credit_Scores entities rather than toy placeholder tables.
- **Deployment validation was tightened** — GitHub Pages builds from current source, checks browser JavaScript syntax, runs the automated test suite, and only deploys after those gates pass.
- **Pre-merge CI was added** — pull requests targeting `main` now build the site, check browser JavaScript syntax, and run the full automated test suite before merge.
- **Recruiter-facing project briefs were added** — project pages now make the problem, data, method, engineering challenge, result, limitations, and code path explicit.
- **iScore architecture was made explicit** — the case study now shows source grain → point-in-time cutoff → feature layer → model/validation → reporting layer.
- **Credit Lab SQL was made deterministic** — duplicate resolution now uses real ordering fields such as `snapshot_date`, the analytical mart no longer uses `SELECT *`, and the mart documents its duplicate release gate.

### Reliability evidence

The iScore runtime regression is intentionally documented rather than hidden. The sequence was: reproduce the live failure → isolate the collection-selector bug → patch the runtime → add a regression test → verify the full GitHub Pages pipeline. The resulting history shows both the failure mode and the control added to prevent recurrence.

## 2026-09-11

### Added

- Initial Data Observatory portfolio.
- Interactive project pages and browser-based data experiments.
- iScore Credit Lab with synthetic credit-risk analytics, SQL, Python, model validation, and saved results.


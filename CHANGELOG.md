# Changelog

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

### Reliability evidence

The iScore runtime regression is intentionally documented rather than hidden. The sequence was: reproduce the live failure → isolate the collection-selector bug → patch the runtime → add a regression test → verify the full GitHub Pages pipeline. The resulting history shows both the failure mode and the control added to prevent recurrence.

## 2026-09-11

### Added

- Initial Data Observatory portfolio.
- Interactive project pages and browser-based data experiments.
- iScore Credit Lab with synthetic credit-risk analytics, SQL, Python, model validation, and saved results.


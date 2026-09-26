# Data Observatory

Interactive portfolio by Marwan Ahmed, focused on risk analytics, SQL/data engineering, model validation, financial analysis, and browser-based data storytelling.

## Reviewer path

For a fast technical review:

1. inspect **IFRS 9 Credit Risk Modeling** for synthetic ECL architecture, staging and scenario-weighted loss calculations,
2. inspect **Credit Risk Model Validation** for discrimination, calibration, stability and observed-vs-expected testing,
3. open the [live Data Observatory](https://mrwanahmedx.github.io/data-observatory/) and review **Credit Risk Lab**,
4. inspect **Credit Risk Management** for grain-safe SQL/data engineering,
5. read the [engineering change log](./CHANGELOG.md) for material fixes and regression controls.

The portfolio is intentionally explicit about limitations: synthetic or illustrative data is labeled, failed assumptions are documented, and reliability changes are preserved in Git history.

## Architecture

```mermaid
flowchart LR
    A[Source project / synthetic assets] --> B[Project-specific analytical logic]
    B --> C[Reusable browser components]
    C --> D[Generated project pages]
    D --> E[Automated tests]
    E --> F[GitHub Pages deployment]

    B --> G[Credit-risk model + SQL validation]
    B --> I[Credit-risk SQL engineering]
    B --> J[Exploratory analytics]
```

## Tech stack

- JavaScript / ES modules
- HTML / CSS
- Node.js build scripts
- Python + SQL source embedded for the Credit Lab
- GitHub Actions CI
- GitHub Pages

## What is in the site

- **IFRS 9 Credit Risk Modeling** — clean-room synthetic ECL engine with configurable staging, PD/LGD/EAD components, macro scenarios, discounting and regression tests.
- **Credit Risk Model Validation** — independent synthetic validation engine covering AUC/Gini, KS, Brier, calibration, PSI, observed-vs-expected testing and explicit verdicts.
- **Credit Risk Lab** — synthetic credit-risk analytics with model performance, calibration, stability, threshold analysis, engineered SQL and Python source shown directly in the browser.
- **Credit Risk Management** — SQL/database design project.
- **Understanding Attrition** — Python exploratory analysis project.
- **Synthetic Credit Risk Model Lab** — executable Python PD-development workflow with borrower-grain controls, validation calibration, held-out testing, PIT-style scenarios and governance documentation.
- Scroll-driven model and data-visualisation experiments on the home page.

All Credit Lab data is synthetic. No employer data, customer records, internal bank models or confidential methods are used.

## Clean-room research modules

- [IFRS 9 Credit Risk Modeling](research/ifrs9-modeling/README.md)
- [Credit Risk Model Validation](research/model-validation/README.md)

GitHub CI currently executes **11 regression tests** across the two modules: 7 for the ECL engine and 4 for the validation engine. The validation demo intentionally returns **PASS WITH LIMITATIONS** when calibration evidence breaches the illustrative governance ranges.

Both modules are governed by [PUBLIC_DATA_BOUNDARY.md](PUBLIC_DATA_BOUNDARY.md). They use synthetic/public concepts only and prohibit employer/customer data, internal schemas, proprietary methods and private model outputs.

## Risk Model Lab

The dedicated model-development project lives in [`risk-model-lab/`](./risk-model-lab/).

Key documentation:

- [Architecture](./risk-model-lab/docs/ARCHITECTURE.md)
- [Data dictionary](./risk-model-lab/docs/DATA_DICTIONARY.md)
- [TTC / PIT concept note](./risk-model-lab/docs/TTC_PIT_NOTE.md)
- [Model governance](./risk-model-lab/docs/MODEL_GOVERNANCE.md)
- [Architecture decision records](./risk-model-lab/docs/decisions/)
- [3.2.0 release notes](./docs/releases/3.2.0.md)

The model lab has its own Python CI in addition to the portfolio browser/unit-test pipelines.

## Development

Requires Node.js 20 or later. No package installation is required.

```sh
npm run build
npm test
node serve.mjs
```

Then open `http://127.0.0.1:4186`.

The source of truth is the repository source files. `build.mjs` creates the deployable site in `dist/`; generated HTML pages and packaged site archives are intentionally not committed.

## Deployment

Pull requests to `main` first run a non-deploying CI gate that builds the site, checks browser JavaScript syntax, and runs the automated test suite. GitHub Pages then rebuilds current source on merged pushes to `main` and deploys `dist/` only if those checks pass again.

The test suite covers:

- dashboard calculations and chart bounds,
- local links and generated assets,
- model metrics and threshold logic,
- Credit Lab SQL/source parity,
- synthetic-data controls,
- navigation and interaction state.

## Credit Lab architecture

Runtime Credit Lab assets live in `assets/credit-lab/`:

- `analytics.json` — synthetic borrower/model results used by the dashboard,
- `results.json` — reference outputs used for generated case-study pages and tests,
- `queries.json` — SQL reports with explicit grain control, duplicate guards and anti-fan-out joins,
- `sources.json` — Python source shown in the web code studio.

The portfolio is intentionally **web-first**: visitors inspect code and saved results in the browser rather than being pushed toward project-file downloads.

[Engineering change log](./CHANGELOG.md) · [Live Data Observatory](https://mrwanahmedx.github.io/data-observatory/) · [GitHub profile](https://github.com/mrwanahmedx) · [LinkedIn](https://www.linkedin.com/in/mrwan-ahmed/)

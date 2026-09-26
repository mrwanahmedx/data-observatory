# Data Observatory

Interactive portfolio by Marwan Ahmed, focused on data science, risk analytics, SQL, model validation and browser-based data storytelling.

## What is in the site

- **Suez Canal Bank dashboard** — an interactive web recreation of the original Power BI project, with coherent selected-year KPI logic and bounded chart rendering.
- **iScore Credit Lab** — synthetic credit-risk analytics with model performance, calibration, stability, threshold analysis, engineered SQL and Python source shown directly in the browser.
- **Credit Risk Management** — SQL/database design project.
- **Understanding Attrition** — Python exploratory analysis project.
- Scroll-driven model and data-visualisation experiments on the home page.

All Credit Lab data is synthetic. No employer data, customer records, internal bank models or confidential methods are used.

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

GitHub Pages builds the current source on every push to `main`, runs the automated test suite, and deploys `dist/` only if the build and tests succeed.

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

[Live Data Observatory](https://mrwanahmedx.github.io/data-observatory/) · [GitHub profile](https://github.com/mrwanahmedx) · [LinkedIn](https://www.linkedin.com/in/mrwan-ahmed/)

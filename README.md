# Data Observatory

My portfolio project with scroll animations, interactive charts and internal project pages.

The intro moves through model layers before opening the main page. The portfolio includes my iScore Credit Lab, with Python, SQL, ROC curves, calibration checks and model documentation.

## Run locally

Requires Node.js 20 or later. No packages to install.

```sh
node build.mjs
node serve.mjs
```

Open http://127.0.0.1:4186. Run `npm test` after building to check the pages, calculations and animations.

## Project files

The root contains source files and ready-to-open HTML pages. `node build.mjs` creates the complete website in `dist/`. The credit lab data, documentation and downloadable Python and SQL project are in `assets/credit-lab/`.

The credit lab uses synthetic data only. It is an independent portfolio project, not affiliated with iScore, and is not intended for real lending decisions. It contains no employer data or internal models. The other interactive examples also use illustrative data.

The site supports reduced motion and includes pause controls. Google Fonts has local font fallbacks.

[My original portfolio](https://mrwanahmedx.github.io/) · [LinkedIn](https://www.linkedin.com/in/mrwan-ahmed/)

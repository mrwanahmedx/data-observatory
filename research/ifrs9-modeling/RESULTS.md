# Tested Reference Result

GitHub Actions run: `Risk Research CI` on Python 3.12.

## Regression suite

**7 tests passed.**

The suite checks deterministic generation, unique exposure grain, Stage 3 precedence, the configurable SICR demo trigger, fail-closed scenario weights, nonnegative ECL, downside-vs-upside ordering, and the lifetime-PD horizon relationship.

## Synthetic reference portfolio

| Metric | Result |
| --- | ---: |
| Exposures | 5,000 |
| Total synthetic balance | 162,268,499.45 |
| Probability-weighted ECL | 10,219,131.99 |
| Stage 1 exposures | 4,113 |
| Stage 2 exposures | 579 |
| Stage 3 exposures | 308 |

Stage ECL in the deterministic reference run:

- Stage 1: 3,595,662.08
- Stage 2: 3,213,498.48
- Stage 3: 3,409,971.43

These numbers describe a fictional generated portfolio. They are regression fixtures, not market/bank estimates and not evidence of provisioning accuracy.

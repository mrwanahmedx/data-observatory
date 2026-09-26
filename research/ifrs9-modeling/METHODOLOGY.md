# Methodology

## Purpose

This case study demonstrates the structure of an IFRS 9 expected-credit-loss workflow using a fictional portfolio. It is intentionally transparent and simplified so a reviewer can inspect the mechanics and the assumptions.

## Accounting concepts represented

The implementation distinguishes:

- **Stage 1:** 12-month ECL.
- **Stage 2:** lifetime ECL after a significant increase in credit risk.
- **Stage 3:** credit-impaired exposure, represented in this educational engine with a default-like PD treatment.

ECL is scenario weighted and discounted, reflecting probability-weighted outcomes, the time value of money, and forward-looking information.

## Illustrative choices — not accounting requirements

The following are public-demo modeling choices:

- 30 DPD as one Stage 2 indicator,
- 90 DPD as one Stage 3/default-like indicator,
- a current-PD/origination-PD ratio of 2.0 as an additional SICR example,
- the synthetic CCF formula used in EAD,
- the collateral-to-LGD relationship,
- the constant-hazard lifetime-PD approximation,
- scenario weights of 60% / 25% / 15%,
- scenario PD and LGD multipliers.

None of these values is presented as IFRS-prescribed, regulatory approval, or employer policy.

## Synthetic data

The generator creates fictional exposures with balances, undrawn amounts, utilization, collateral coverage, debt-service ratios, DPD, origination/current PD, effective interest rates, and remaining maturity.

The synthetic PD relationship is deliberately simple and exists to make the pipeline testable. It is not calibrated to any real population.

## EAD

The demonstration uses:

`EAD = balance + CCF(utilization) × undrawn`

The CCF is bounded and synthetic.

## LGD

LGD decreases with synthetic collateral coverage and increases modestly for more delinquent exposures. The relationship is illustrative, not an empirical recovery model.

## PD and horizon

Stage 1 uses the scenario-adjusted 12-month PD. Stage 2 uses a lifetime transformation:

`1 - (1 - PD_12m)^years`

This is a simple constant-hazard approximation for demonstration. Stage 3 uses a default-like probability of 1.0 in the ECL expression.

## Discounting

Expected loss is discounted using the synthetic effective-interest-rate field and the selected horizon.

## Validation controls

Tests cover:

- deterministic generation,
- unique exposure grain,
- Stage 3 precedence,
- configurable SICR behavior,
- scenario weights summing to 1,
- nonnegative ECL,
- preservation of exposure count,
- downside aggregate ECL exceeding upside aggregate ECL,
- lifetime PD not falling below 12-month PD for positive horizons.

## Limitations

This repository does not implement contractual cash-flow schedules, cure/default timing, multiple-period marginal PD term structures, recovery timing, collateral liquidation costs, write-offs, management overlays, post-model adjustments, model calibration, or regulatory reporting.

Those omissions are deliberate: the public objective is to demonstrate architecture, assumptions, controls, and validation discipline without pretending a small synthetic project is a production ECL platform.

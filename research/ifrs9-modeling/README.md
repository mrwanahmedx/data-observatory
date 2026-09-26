# IFRS 9 Credit Risk Modeling Lab

Clean-room expected-credit-loss research using deterministic **synthetic data only**.

> Educational portfolio implementation. Not a production impairment engine, not regulatory advice, and not derived from an employer system.

## Problem

Build a transparent exposure-level ECL pipeline that demonstrates the accounting/modeling flow without hiding key assumptions inside a notebook.

## Design

```text
synthetic exposures
  -> input checks
  -> configurable staging
  -> PD / LGD / EAD components
  -> baseline / downside / upside scenarios
  -> discounted scenario-weighted ECL
  -> portfolio reconciliation
```

The broad Stage 1 / Stage 2 / Stage 3 and 12-month/lifetime-ECL concepts follow public IFRS 9 impairment principles. Numeric triggers in this demo are **illustrative configuration choices**, not IFRS-prescribed thresholds and not bank policy.

## Files

- `ifrs9_model.py` — synthetic generator, staging, risk components and ECL engine.
- `test_ifrs9_model.py` — regression and accounting-logic checks.
- `METHODOLOGY.md` — assumptions, limitations and governance boundary.

## Run

```bash
python -m pip install numpy pandas
python research/ifrs9-modeling/ifrs9_model.py
python -m unittest research/ifrs9-modeling/test_ifrs9_model.py -v
```

## Confidentiality

No employer/customer data, internal schemas, private parameters, screenshots, or proprietary workflows are used. See the repository-level `PUBLIC_DATA_BOUNDARY.md`.

# TTC / PIT Concept Note

## Purpose

This note distinguishes **concept demonstration** from regulatory model implementation.

A through-the-cycle (TTC) PD is intended to be relatively less sensitive to short-run macro conditions. A point-in-time (PIT) PD is intended to reflect current / forecast conditions more directly.

Real bank implementations can involve rating migration, macroeconomic models, segment calibration, scenario weighting, default-rate history, model overlays, and governance constraints. This repository does **not** reproduce any bank or regulator methodology.

## Implemented teaching mechanism

The lab starts from borrower-level base PDs and applies one common log-odds shift:

```text
logit(PD_PIT_i) = logit(PD_base_i) + shift
```

The shift is solved numerically so that:

```text
mean(PD_PIT) = target portfolio mean PD
```

This has two useful properties for demonstration:

1. it changes the portfolio default level transparently,
2. it preserves borrower ordering because the same monotonic shift is applied to every borrower.

## Scenarios

The example pipeline creates upside / baseline / downside **illustrative** targets around the model's test-sample mean PD.

These are not economic forecasts and are not scenario weights.

## What would be required for a real implementation

A production PIT framework would require, at minimum:

- historical default-rate evidence,
- explicit TTC definition,
- macroeconomic variable selection and transformations,
- segment-specific relationships,
- forecast scenarios and weights,
- calibration-window governance,
- model uncertainty treatment,
- backtesting,
- sensitivity and stability analysis,
- independent validation,
- documented overrides / overlays.

The correct interpretation of this repository is therefore: **transparent PIT mechanics demonstration, not regulatory PIT calibration**.

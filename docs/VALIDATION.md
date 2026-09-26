# Validation Notes

## Development boundary

The project uses a chronological cohort split. Development rows must have observation dates strictly earlier than the first validation observation date.

## Discrimination

ROC AUC and KS are used as ranking diagnostics.

## Probability quality

Brier score and calibration by equal-frequency risk buckets are reported.

## Stability

PSI is demonstrated for utilization using development quantile cut points.

## Controls

Tests enforce:

- deterministic synthetic generation,
- no outcome / latent PD in model features,
- strict time separation,
- probability bounds,
- staging precedence,
- non-negative simplified ECL,
- executable end-to-end pipeline.

## What is deliberately missing

There is no claim of:

- regulatory calibration,
- TTC-to-PIT conversion,
- lifetime PD term structures,
- downturn LGD,
- CCF/EAD modeling,
- survival analysis,
- challenger-model superiority,
- production monitoring thresholds.

Those would require evidence and design choices beyond this synthetic baseline.

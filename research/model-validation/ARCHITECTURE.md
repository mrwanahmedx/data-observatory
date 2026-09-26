# Architecture

```mermaid
flowchart LR
    A[Synthetic development sample] --> B[Reference score distribution]
    C[Synthetic test sample] --> D[Discrimination]
    C --> E[Calibration]
    C --> F[Probability error]
    A --> G[PSI stability]
    C --> G
    C --> H[Observed vs expected]
    D --> I[Evidence register]
    E --> I
    F --> I
    G --> I
    H --> I
    I --> J{Demo decision rules}
    J -->|hard breach| K[REDEVELOPMENT REQUIRED]
    J -->|limitations| L[PASS WITH LIMITATIONS]
    J -->|no breach| M[PASS]
```

## Validation principle

A single metric never decides model quality. Ranking, calibration, stability, probability error, event sufficiency and outcome backtesting are recorded separately before a visible decision rule is applied.

## Independence boundary

The validation module consumes predictions/outcomes as evidence. It does not train the model being validated or alter predictions to obtain a preferred verdict.

from __future__ import annotations

import json

from .calibration import calibration_table
from .data import generate_portfolio, time_split
from .ifrs9 import assign_stage, simplified_ecl
from .model import fit_model, score, validate
from .monitoring import population_stability_index


def run(seed: int = 20260926) -> dict:
    portfolio = generate_portfolio(seed=seed)
    development, validation = time_split(portfolio)

    model = fit_model(development)
    metrics = validate(model, validation)
    validation_pd = score(model, validation)

    calibration = calibration_table(validation["default_12m"], validation_pd)
    utilization_psi = population_stability_index(
        development["utilization"],
        validation["utilization"],
    )

    stage = assign_stage(
        current_pd=validation_pd,
        origination_pd=validation["origination_pd"].clip(lower=0.005),
        dpd=validation["max_dpd_12m"],
        default_flag=validation["default_12m"].astype(bool),
    )
    ecl = simplified_ecl(validation_pd, validation["lgd"], validation["ead"], 0.97)

    return {
        "development_rows": int(len(development)),
        "validation_rows": int(len(validation)),
        "validation_auc": metrics.auc,
        "validation_brier": metrics.brier,
        "validation_ks": metrics.ks,
        "validation_event_rate": metrics.event_rate,
        "validation_mean_pd": metrics.mean_pd,
        "utilization_psi": utilization_psi,
        "stage_counts": {str(k): int(v) for k, v in stage.value_counts().sort_index().items()},
        "total_simplified_ecl": float(ecl.sum()),
        "calibration": calibration.round(6).to_dict(orient="records"),
    }


def main() -> None:
    print(json.dumps(run(), indent=2))


if __name__ == "__main__":
    main()

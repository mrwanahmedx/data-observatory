import importlib.util
from pathlib import Path
import unittest
import sys

import numpy as np
import pandas as pd

path = Path(__file__).with_name("validation_lab.py")
spec = importlib.util.spec_from_file_location("validation_lab", path)
lab = importlib.util.module_from_spec(spec)
assert spec.loader is not None
sys.modules[spec.name] = lab
spec.loader.exec_module(lab)


class ValidationLabTests(unittest.TestCase):
    def test_gini_matches_auc_identity(self):
        data = lab.generate_validation_data(n=1800, seed=1, model_quality="good")
        test = data[data["split"] == "test"]
        auc, gini = lab.auc_gini(test["bad"], test["pd"])
        self.assertAlmostEqual(gini, 2 * auc - 1, places=12)

    def test_observed_expected_respects_heterogeneous_probabilities(self):
        # Two independent PDs of 1% and 99% give P(no events) = 0.0099.
        result = lab.observed_expected_backtest(
            pd.Series([0, 0]), pd.Series([0.01, 0.99])
        )
        self.assertAlmostEqual(result["expected_events"], 1.0)
        self.assertAlmostEqual(result["poisson_binomial_p_value"], 0.0198, places=6)

    def test_observed_expected_rejects_invalid_pd(self):
        with self.assertRaises(ValueError):
            lab.observed_expected_backtest(pd.Series([0, 1]), pd.Series([0.1, 1.2]))

    def test_psi_same_sample_is_zero(self):
        sample = pd.Series(np.linspace(0.01, 0.40, 500))
        self.assertAlmostEqual(lab.psi(sample, sample), 0.0, places=12)

    def test_psi_detects_drift_from_constant_reference(self):
        baseline = pd.Series([0.1] * 100)
        shifted = pd.Series([0.9] * 100)
        self.assertAlmostEqual(lab.psi(baseline, baseline), 0.0)
        self.assertGreater(lab.psi(baseline, shifted), 0.25)

    def test_calibration_table_preserves_population(self):
        data = lab.generate_validation_data(n=1800, seed=3, model_quality="good")
        test = data[data["split"] == "test"]
        table = lab.calibration_table(test["bad"], test["pd"])
        self.assertEqual(int(table["borrowers"].sum()), len(test))

    def test_poor_model_does_not_get_clean_pass(self):
        data = lab.generate_validation_data(n=6000, seed=8, model_quality="poor")
        dev = data[data["split"] == "development"]
        test = data[data["split"] == "test"]
        result = lab.validate_model(dev, test)
        self.assertNotEqual(result["verdict"], "PASS")


    def test_migration_matrix_preserves_population(self):
        prior = pd.Series(np.linspace(0.005, 0.30, 500))
        current = pd.Series(np.clip(prior * 1.15, 0, 1))
        matrix = lab.migration_matrix(prior, current)
        self.assertEqual(int(matrix.to_numpy().sum()), len(prior))
        self.assertEqual(list(matrix.index), list(lab.GRADE_LABELS))
        self.assertEqual(list(matrix.columns), list(lab.GRADE_LABELS))

    def test_override_audit_is_traceable(self):
        base = pd.DataFrame(
            {
                "borrower_id": ["B1", "B2", "B3", "B4"],
                "pd": [0.02, 0.04, 0.08, 0.12],
            }
        )
        overrides = pd.DataFrame(
            {
                "borrower_id": ["B2", "B4"],
                "overridden_pd": [0.06, 0.10],
                "reason": ["new information", "data correction"],
            }
        )
        result = lab.audit_overrides(base, overrides)
        self.assertEqual(result["overrides"], 2)
        self.assertEqual(result["upward"], 1)
        self.assertEqual(result["downward"], 1)
        self.assertAlmostEqual(result["override_rate"], 0.5)

    def test_override_audit_rejects_duplicate_borrower(self):
        base = pd.DataFrame({"borrower_id": ["B1"], "pd": [0.02]})
        overrides = pd.DataFrame(
            {
                "borrower_id": ["B1", "B1"],
                "overridden_pd": [0.03, 0.04],
                "reason": ["one", "two"],
            }
        )
        with self.assertRaises(ValueError):
            lab.audit_overrides(base, overrides)

    def test_markdown_report_carries_verdict(self):
        data = lab.generate_validation_data(n=6000, seed=8, model_quality="poor")
        dev = data[data["split"] == "development"]
        test = data[data["split"] == "test"]
        result = lab.validate_model(dev, test)
        report = lab.render_validation_report(result)
        self.assertIn(result["verdict"], report)
        self.assertIn("Synthetic/public portfolio exercise", report)

if __name__ == "__main__":
    unittest.main()

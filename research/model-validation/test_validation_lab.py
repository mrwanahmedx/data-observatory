import importlib.util
from pathlib import Path
import unittest

import numpy as np
import pandas as pd

path = Path(__file__).with_name("validation_lab.py")
spec = importlib.util.spec_from_file_location("validation_lab", path)
lab = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(lab)


class ValidationLabTests(unittest.TestCase):
    def test_gini_matches_auc_identity(self):
        data = lab.generate_validation_data(n=1800, seed=1, model_quality="good")
        test = data[data["split"] == "test"]
        auc, gini = lab.auc_gini(test["bad"], test["pd"])
        self.assertAlmostEqual(gini, 2 * auc - 1, places=12)

    def test_psi_same_sample_is_zero(self):
        sample = pd.Series(np.linspace(0.01, 0.40, 500))
        self.assertAlmostEqual(lab.psi(sample, sample), 0.0, places=12)

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


if __name__ == "__main__":
    unittest.main()

import importlib.util
from pathlib import Path
import unittest

import numpy as np

MODULE_PATH = Path(__file__).with_name("ifrs9_model.py")
spec = importlib.util.spec_from_file_location("ifrs9_model", MODULE_PATH)
m = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(m)


class IFRS9ModelTests(unittest.TestCase):
    def test_generator_is_reproducible_and_unique(self):
        a = m.generate_portfolio(n=250, seed=7)
        b = m.generate_portfolio(n=250, seed=7)
        self.assertTrue(a.equals(b))
        self.assertEqual(a["exposure_id"].nunique(), len(a))

    def test_stage3_precedence_over_stage2(self):
        df = m.generate_portfolio(n=20, seed=11)
        df.loc[0, "dpd"] = 120
        df.loc[0, "credit_impaired"] = 1
        df.loc[0, "current_pd"] = df.loc[0, "origination_pd"] * 4
        stages = m.assign_stage(df)
        self.assertEqual(int(stages.iloc[0]), 3)

    def test_demo_sicr_trigger_moves_exposure_to_stage2(self):
        df = m.generate_portfolio(n=20, seed=12)
        df.loc[0, "dpd"] = 0
        df.loc[0, "credit_impaired"] = 0
        df.loc[0, "current_pd"] = df.loc[0, "origination_pd"] * 2.5
        stages = m.assign_stage(df)
        self.assertEqual(int(stages.iloc[0]), 2)

    def test_invalid_scenario_weights_fail_closed(self):
        df = m.generate_portfolio(n=50, seed=3)
        bad = (
            m.Scenario("a", 0.6, 1.0, 0.0),
            m.Scenario("b", 0.3, 1.2, 0.1),
        )
        with self.assertRaises(ValueError):
            m.calculate_ecl(df, bad)

    def test_ecl_is_nonnegative_and_grain_is_preserved(self):
        base = m.generate_portfolio(n=1000, seed=99)
        out = m.calculate_ecl(base)
        self.assertEqual(len(out), len(base))
        self.assertEqual(out["exposure_id"].nunique(), len(out))
        self.assertTrue((out["ecl"] >= 0).all())

    def test_downside_scenario_is_not_lower_than_upside(self):
        base = m.generate_portfolio(n=500, seed=21)
        out = m.calculate_ecl(base)
        self.assertGreater(
            float(out["ecl_downside"].sum()),
            float(out["ecl_upside"].sum()),
        )

    def test_lifetime_pd_not_below_12m_for_positive_horizon(self):
        pd_12m = m.generate_portfolio(n=200, seed=4)["current_pd"]
        years = m.generate_portfolio(n=200, seed=4)["remaining_years"]
        life = m.lifetime_pd(pd_12m, years)
        self.assertTrue(np.all(life.to_numpy() + 1e-12 >= pd_12m.to_numpy()))


if __name__ == "__main__":
    unittest.main()

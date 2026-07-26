import sys
import unittest
from fastapi.testclient import TestClient
from main import app

class FitStreamBackendTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_auth_register_and_login(self):
        register_payload = {
            "email": "unittest_athlete@fitstream.app",
            "password": "securepassword123",
            "full_name": "Unittest Athlete",
            "height_cm": 180.0,
            "weight_kg": 75.0,
            "target_weight_kg": 72.0,
            "age": 28,
            "gender": "Male"
        }
        res = self.client.post("/auth/register", json=register_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["user"]["email"], "unittest_athlete@fitstream.app")

        login_payload = {
            "email": "unittest_athlete@fitstream.app",
            "password": "securepassword123"
        }
        l_res = self.client.post("/auth/login", json=login_payload)
        self.assertEqual(l_res.status_code, 200)
        self.assertIn("access_token", l_res.json())

    def test_02_daily_tracker(self):
        res = self.client.get("/daily/log?user_id=1")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("water_ml", data)
        self.assertIn("target_water_ml", data)

        w_res = self.client.post("/daily/water", json={"user_id": "1", "amount_ml": 500, "set_exact": False})
        self.assertEqual(w_res.status_code, 200)
        self.assertGreaterEqual(w_res.json()["water_ml"], 500)

    def test_03_challenges_catalog(self):
        res = self.client.get("/challenges/catalog")
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.json()), 4)

        d_res = self.client.get("/challenges/details/abs-30?user_id=1")
        self.assertEqual(d_res.status_code, 200)
        self.assertEqual(len(d_res.json()["schedule"]), 30)

    def test_04_workouts_presets(self):
        res = self.client.get("/workouts/presets")
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.json()), 4)

    def test_05_export_csv(self):
        res = self.client.get("/export/csv?user_id=1")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers["content-type"], "text/csv; charset=utf-8")

if __name__ == "__main__":
    unittest.main()

import sys
import uuid
import unittest
from fastapi.testclient import TestClient
from main import app

class FitStreamFullCoverageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_auth_register_and_login(self):
        unique_email = f"test_{uuid.uuid4().hex[:6]}@fitstream.app"
        register_payload = {
            "email": unique_email,
            "password": "securepassword123",
            "full_name": "Coverage Athlete",
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
        self.assertEqual(data["user"]["email"], unique_email)

        # Login
        l_res = self.client.post("/auth/login", json={"email": unique_email, "password": "securepassword123"})
        self.assertEqual(l_res.status_code, 200)
        token = l_res.json()["access_token"]

        # /auth/me with Bearer token
        me_res = self.client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me_res.status_code, 200)
        self.assertEqual(me_res.json()["email"], unique_email)

    def test_02_daily_tracker(self):
        res = self.client.get("/daily/log?user_id=1")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("water_ml", data)
        self.assertIn("target_water_ml", data)

        # Water intake
        w_res = self.client.post("/daily/water", json={"user_id": "1", "amount_ml": 500, "set_exact": False})
        self.assertEqual(w_res.status_code, 200)

        # Body metrics
        m_res = self.client.post("/daily/metrics", json={
            "user_id": "1",
            "height_cm": 178.0,
            "weight_kg": 72.5,
            "waist_cm": 81.0,
            "bicep_cm": 36.0
        })
        self.assertEqual(m_res.status_code, 200)

        # Streak
        s_res = self.client.get("/daily/streak?user_id=1")
        self.assertEqual(s_res.status_code, 200)
        self.assertIn("current_streak", s_res.json())

    def test_03_challenges_all(self):
        res = self.client.get("/challenges/catalog")
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.json()), 4)

        # Start challenge
        st_res = self.client.post("/challenges/start", json={"user_id": "1", "challenge_id": "abs-30"})
        self.assertEqual(st_res.status_code, 200)

        # Complete Day 1
        cd_res = self.client.post("/challenges/complete-day", json={"user_id": "1", "challenge_id": "abs-30", "day_number": 1})
        self.assertEqual(cd_res.status_code, 200)

        # Details
        d_res = self.client.get("/challenges/details/abs-30?user_id=1")
        self.assertEqual(d_res.status_code, 200)
        self.assertEqual(len(d_res.json()["schedule"]), 30)

    def test_04_workouts_presets_and_sessions(self):
        p_res = self.client.get("/workouts/presets")
        self.assertEqual(p_res.status_code, 200)
        self.assertGreaterEqual(len(p_res.json()), 4)

        # Create custom routine
        c_res = self.client.post("/workouts", json={
            "user_id": "1",
            "name": "Full Coverage Routine",
            "description": "Routine for test",
            "category": "Hypertrophy",
            "exercises": [{"name": "Barbell Bench Press", "target": "Chest", "sets": 3, "reps": 10, "weight": 60.0}]
        })
        self.assertEqual(c_res.status_code, 200)
        workout_id = c_res.json()["id"]

        # Workout details
        dt_res = self.client.get(f"/workouts/{workout_id}")
        self.assertEqual(dt_res.status_code, 200)

        # Start session
        sess_res = self.client.post(f"/workouts/{workout_id}/sessions?user_id=1")
        self.assertEqual(sess_res.status_code, 200)
        session_id = sess_res.json()["id"]

        # Log set
        set_res = self.client.post(f"/workouts/sessions/{session_id}/sets", json={
            "workout_exercise_id": "ex-1",
            "set_number": 1,
            "reps_completed": 10,
            "weight_kg": 60.0
        })
        self.assertEqual(set_res.status_code, 200)

        # Complete session
        comp_res = self.client.post(f"/workouts/sessions/{session_id}/complete?user_id=1")
        self.assertEqual(comp_res.status_code, 200)

        # Delete routine
        del_res = self.client.delete(f"/workouts/{workout_id}")
        self.assertEqual(del_res.status_code, 200)

    def test_05_gps_maps(self):
        route_payload = {
            "user_id": "1",
            "title": "Test Run",
            "activity_type": "Running",
            "distance_km": 3.5,
            "duration_seconds": 1200,
            "avg_speed_kmh": 10.5,
            "calories_burned": 225,
            "elevation_gain_m": 12.0,
            "coordinates": [{"lat": 28.6139, "lng": 77.2090}, {"lat": 28.6145, "lng": 77.2095}]
        }
        res = self.client.post("/maps/route", json=route_payload)
        self.assertEqual(res.status_code, 200)

        get_res = self.client.get("/maps/routes?user_id=1")
        self.assertEqual(get_res.status_code, 200)

    def test_06_reset_endpoints(self):
        r1 = self.client.post("/reset/today?user_id=1")
        self.assertEqual(r1.status_code, 200)

        r2 = self.client.post("/reset/challenge", json={"user_id": "1", "challenge_id": "abs-30"})
        self.assertEqual(r2.status_code, 200)

        r3 = self.client.post("/reset/custom-workouts?user_id=1")
        self.assertEqual(r3.status_code, 200)

    def test_07_knowledge_base(self):
        res = self.client.get("/knowledge/wiki")
        self.assertEqual(res.status_code, 200)
        self.assertIn("articles", res.json())

    def test_08_export_csv(self):
        res = self.client.get("/export/csv?user_id=1")
        self.assertEqual(res.status_code, 200)
        self.assertIn("text/csv", res.headers["content-type"])

    def test_09_account_deletion(self):
        unique_del_email = f"del_{uuid.uuid4().hex[:6]}@fitstream.app"
        reg = self.client.post("/auth/register", json={
            "email": unique_del_email,
            "password": "password123",
            "full_name": "Delete Me"
        }).json()
        token = reg["access_token"]

        del_res = self.client.delete("/auth/account", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(del_res.status_code, 200)

if __name__ == "__main__":
    unittest.main()

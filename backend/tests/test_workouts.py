def test_workout_presets_and_creation(client):
    p_res = client.get("/workouts/presets")
    assert p_res.status_code == 200
    presets = p_res.json()
    assert len(presets) >= 4

    create_payload = {
        "user_id": "1",
        "name": "Test Hypertrophy Routine",
        "description": "Pytest custom routine",
        "category": "Hypertrophy",
        "exercises": [
            {"name": "Bench Press", "target": "Chest", "sets": 3, "reps": 10, "weight": 60.0}
        ]
    }
    c_res = client.post("/workouts", json=create_payload)
    assert c_res.status_code == 200
    c_data = c_res.json()
    assert "id" in c_data

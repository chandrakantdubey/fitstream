def test_daily_log_and_water(client):
    res = client.get("/daily/log?user_id=1")
    assert res.status_code == 200
    data = res.json()
    assert "water_ml" in data
    assert "target_water_ml" in data
    assert "bmi" in data
    assert "bmr_calories" in data

    w_res = client.post("/daily/water", json={"user_id": "1", "amount_ml": 500, "set_exact": False})
    assert w_res.status_code == 200
    w_data = w_res.json()
    assert w_data["water_ml"] >= 500

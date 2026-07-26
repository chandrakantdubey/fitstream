def test_register_and_login(client):
    register_payload = {
        "email": "pytest_athlete@fitstream.app",
        "password": "securepassword123",
        "full_name": "Pytest Athlete",
        "height_cm": 180.0,
        "weight_kg": 75.0,
        "target_weight_kg": 72.0,
        "age": 28,
        "gender": "Male"
    }
    res = client.post("/auth/register", json=register_payload)
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "pytest_athlete@fitstream.app"

    login_payload = {
        "email": "pytest_athlete@fitstream.app",
        "password": "securepassword123"
    }
    l_res = client.post("/auth/login", json=login_payload)
    assert l_res.status_code == 200
    l_data = l_res.json()
    assert "access_token" in l_data

def test_challenges_catalog_and_details(client):
    c_res = client.get("/challenges/catalog")
    assert c_res.status_code == 200
    catalog = c_res.json()
    assert len(catalog) >= 4

    d_res = client.get("/challenges/details/abs-30?user_id=1")
    assert d_res.status_code == 200
    details = d_res.json()
    assert "template" in details
    assert len(details["schedule"]) == 30

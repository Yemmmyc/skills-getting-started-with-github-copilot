import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data
    assert "Programming Class" in data


def test_signup_for_activity_success():
    email = "newstudent@mergington.edu"
    activity = "Chess Club"
    # Ensure not already signed up
    client.post(f"/activities/{activity}/unregister", json={"email": email})
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert f"Signed up {email} for {activity}" in response.json()["message"]


def test_signup_for_activity_already_signed_up():
    email = "michael@mergington.edu"
    activity = "Chess Club"
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]


def test_signup_for_activity_max_participants():
    activity = "Chess Club"
    # Fill up the activity
    for i in range(12):
        email = f"student{i}@mergington.edu"
        client.post(f"/activities/{activity}/signup?email={email}")
    # Try to add one more
    response = client.post(f"/activities/{activity}/signup?email=overflow@mergington.edu")
    assert response.status_code == 400
    assert "Maximum participants reached" in response.json()["detail"]


def test_unregister_from_activity_success():
    email = "daniel@mergington.edu"
    activity = "Chess Club"
    response = client.post(f"/activities/{activity}/unregister", json={"email": email})
    assert response.status_code == 200
    assert f"Unregistered {email} from {activity}" in response.json()["message"]


def test_unregister_from_activity_not_registered():
    email = "notfound@mergington.edu"
    activity = "Chess Club"
    response = client.post(f"/activities/{activity}/unregister", json={"email": email})
    assert response.status_code == 400
    assert "not registered" in response.json()["detail"]

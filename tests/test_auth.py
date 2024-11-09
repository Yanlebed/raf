from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_login_access_token(db):
    response = client.post(
        "/api/v1/login/access-token",
        data={"username": "testuser", "password": "testpassword"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

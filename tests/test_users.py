from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_create_user():
    response = client.post(
        "/api/v1/users/",
        json={
            "user_type": "CLIENT",
            "phone": "1234567890",
            "password": "testpassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["phone"] == "1234567890"
    assert "id" in data

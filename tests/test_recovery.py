from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert data["message"] == "RecoverAI API is running"


def test_prediction_endpoint():
    response = client.get(
        "/api/recovery/predict/1003"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["transaction_id"] == 1003
    assert 0.0 <= data["recovery_probability"] <= 1.0
    assert isinstance(data["recoverable"], bool)
    assert 0.0 <= data["threshold"] <= 1.0
    assert "recommended_action" in data
    assert "priority" in data
    assert "reason" in data


def test_prediction_invalid_transaction():
    response = client.get(
        "/api/recovery/predict/999999"
    )

    assert response.status_code == 404


def test_recovery_case_duplicate():
    response = client.post(
        "/api/recovery/cases/1003"
    )

    assert response.status_code == 409
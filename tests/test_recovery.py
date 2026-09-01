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

def test_list_recovery_cases():
    response = client.get(
        "/api/recovery/cases"
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) >= 1

    case = data[0]

    assert "recovery_case_id" in case
    assert "transaction_id" in case
    assert "recovery_probability" in case
    assert "reason" in case
    assert "status" in case
    assert "estimated_revenue" in case


def test_get_recovery_case():
    response = client.get(
        "/api/recovery/cases/2"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["recovery_case_id"] == 2
    assert data["transaction_id"] == 1005
    assert "action" in data

    assert data["action"]["action_type"] == "retry_payment"
    assert data["action"]["status"] == "executed"


def test_get_recovery_case_not_found():
    response = client.get(
        "/api/recovery/cases/99999"
    )

    assert response.status_code == 404


def test_list_recovery_actions():
    response = client.get(
        "/api/recovery/cases/2/actions"
    )

    assert response.status_code == 200

    data = response.json()

    assert isinstance(data, list)
    assert len(data) >= 1

    action = data[0]

    assert "action_id" in action
    assert "action_type" in action
    assert "status" in action
    assert "reason" in action
    assert "result" in action
    assert "executed_at" in action


def test_list_recovery_actions_not_found():
    response = client.get(
        "/api/recovery/cases/99999/actions"
    )

    assert response.status_code == 404


def test_execute_already_executed_case():
    response = client.post(
        "/api/recovery/cases/2/execute"
    )

    assert response.status_code == 409
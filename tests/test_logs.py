import copy
import logging
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from src.app import app, activities, configure_logging

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_activities():
    initial_state = copy.deepcopy(activities)
    yield
    activities.clear()
    activities.update(copy.deepcopy(initial_state))


def test_console_logging_is_emitted_for_requests(caplog):
    # Arrange
    configure_logging(log_file=None)
    caplog.set_level(logging.INFO, logger="mergington")
    activity_name = "Chess Club"
    email = "newstudent@mergington.edu"

    # Act
    response = client.post(f"/activities/{activity_name}/signup", params={"email": email})

    # Assert
    assert response.status_code == 200
    assert any("Signup request received" in record.message for record in caplog.records)
    assert any("Signed up newstudent@mergington.edu for Chess Club" in record.message for record in caplog.records)


def test_file_logging_writes_to_log_file(tmp_path):
    # Arrange
    log_path = tmp_path / "activity_app.log"
    configure_logging(str(log_path))
    activity_name = "Chess Club"
    email = "newstudent@mergington.edu"

    # Act
    response = client.post(f"/activities/{activity_name}/signup", params={"email": email})

    # Assert
    assert response.status_code == 200
    assert log_path.exists(), "Expected log file to be created"
    log_contents = log_path.read_text(encoding="utf-8")
    assert "Signup request received" in log_contents
    assert "Signed up newstudent@mergington.edu for Chess Club" in log_contents

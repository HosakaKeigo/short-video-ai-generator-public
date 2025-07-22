import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    """テストクライアントのフィクスチャ"""
    return TestClient(app)

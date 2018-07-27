import pytest
# from code import db
import app

def test_func():
    pass

@pytest.fixture
def db_connection():
    return db.engine.connect()
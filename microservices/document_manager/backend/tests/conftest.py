import uuid
import pytest
from datetime import datetime, timedelta

from app import create_app
from app.config import TestConfig
from app.extensions import db, jwt as _jwt
from app.utils.include.user_info import User

from tests.constants import *
from tests.factories import FACTORY_LIST

from flask_migrate import upgrade, command


@pytest.fixture(scope="session")
def app(request):
    app = create_app(TestConfig)
    db.create_all()
    return app


@pytest.fixture(scope="session")
def auth_headers(app):
    base_auth_token = _jwt.create_jwt(BASE_AUTH_CLAIMS, TOKEN_HEADER)
    full_auth_token = _jwt.create_jwt(FULL_AUTH_CLAIMS, TOKEN_HEADER)
    view_only_auth_token = _jwt.create_jwt(NRIS_VIEW_ONLY_AUTH_CLAIMS, TOKEN_HEADER)
    return {
        'base_auth_header': {
            'Authorization': 'Bearer ' + base_auth_token
        },
        'full_auth_header': {
            'Authorization': 'Bearer ' + full_auth_token
        },
        'view_only_auth_header': {
            'Authorization': 'Bearer ' + view_only_auth_token
        }
    }


@pytest.fixture(scope="session")
def cli_runner(app):
    runner = app.test_cli_runner()
    return runner


@pytest.fixture(scope='session')
def test_client():
    app = create_app(TestConfig)
    client = app.test_client()
    ctx = app.app_context()
    ctx.push()

    User._test_mode = True

    yield client

    ctx.pop()


@pytest.fixture(scope="function")
def db_session(test_client):
    conn = db.engine.connect()
    txn = conn.begin()

    options = dict(bind=conn, binds={})
    sess = db.create_scoped_session(options=options)
    db.session = sess

    for factory in FACTORY_LIST:
        factory._meta.sqlalchemy_session = sess

    yield db.session

    sess.remove()
    txn.rollback()
    conn.close()

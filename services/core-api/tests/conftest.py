import uuid
import pytest
from datetime import datetime, timedelta

from app import create_app
from app.config import TestConfig
from app.extensions import db, jwt as _jwt
from app.api.utils.include.user_info import User
from app.api.utils.setup_marshmallow import setup_marshmallow

from .constants import *
from tests.factories import FACTORY_LIST

from app import auth
auth.apply_security = False


def pytest_itemcollected(item):
    par = item.parent.obj
    node = item.obj
    pref = par.__doc__.strip() if par.__doc__ else par.__class__.__name__
    suf = node.__doc__.strip() if node.__doc__ else node.__name__
    if pref or suf:
        item._nodeid = ' '.join((pref, suf))


@pytest.fixture(scope="session")
def app(request):
    app = create_app(TestConfig)
    return app


@pytest.fixture(scope="session")
def auth_headers(app):
    base_auth_token = _jwt.create_jwt(BASE_AUTH_CLAIMS, TOKEN_HEADER)
    full_auth_token = _jwt.create_jwt(FULL_AUTH_CLAIMS, TOKEN_HEADER)
    view_only_auth_token = _jwt.create_jwt(VIEW_ONLY_AUTH_CLAIMS, TOKEN_HEADER)
    create_only_auth_token = _jwt.create_jwt(CREATE_ONLY_AUTH_CLAIMS, TOKEN_HEADER)
    admin_only_auth_token = _jwt.create_jwt(ADMIN_ONLY_AUTH_CLAIMS, TOKEN_HEADER)
    proponent_only_auth_token = _jwt.create_jwt(PROPONENT_ONLY_AUTH_CLAIMS, TOKEN_HEADER)
    nros_vfcbc_only_auth_token = _jwt.create_jwt(NROS_VFCBC_AUTH_CLAIMS, TOKEN_HEADER)
    core_edit_parties_only_auth_token = _jwt.create_jwt(CORE_EDIT_PARTIES_AUTH_CLAIMS, TOKEN_HEADER)
    incorrect_aud_auth_token = _jwt.create_jwt(FULL_AUTH_CLAIMS | {'aud': 'invalid_aud'}, TOKEN_HEADER)
    incorrect_iss_auth_token = _jwt.create_jwt(FULL_AUTH_CLAIMS | {'iss': 'invalid_iss'}, TOKEN_HEADER)
    expired_auth_token = _jwt.create_jwt(FULL_AUTH_CLAIMS | {'iat': 1675197826, 'exp': 1706647426}, TOKEN_HEADER)

    return {
        'base_auth_header': {
            'Authorization': 'Bearer ' + base_auth_token
        },
        'full_auth_header': {
            'Authorization': 'Bearer ' + full_auth_token
        },
        'view_only_auth_header': {
            'Authorization': 'Bearer ' + view_only_auth_token
        },
        'create_only_auth_header': {
            'Authorization': 'Bearer ' + create_only_auth_token
        },
        'admin_only_auth_header': {
            'Authorization': 'Bearer ' + admin_only_auth_token
        },
        'proponent_only_auth_header': {
            'Authorization': 'Bearer ' + proponent_only_auth_token
        },
        'nros_vfcbc_auth_header': {
            'Authorization': 'Bearer ' + nros_vfcbc_only_auth_token
        },
        'core_edit_parties_only_auth_header': {
            'Authorization': 'Bearer ' + core_edit_parties_only_auth_token
        },
        'incorrect_aud_auth_header': {
            'Authorization': 'Bearer ' + incorrect_aud_auth_token
        },
        'incorrect_iss_auth_header': {
            'Authorization': 'Bearer ' + incorrect_iss_auth_token
        },
        'expired_auth_header': {
            'Authorization': 'Bearer ' + expired_auth_token
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

    # The event that this function runs off of is never fired
    # when the tests are run so it has to be called manually.
    setup_marshmallow()

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

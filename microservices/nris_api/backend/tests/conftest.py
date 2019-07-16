import pytest

from app import create_app
from app.config import TestConfig, EtlTestConfig
from app.extensions import db, jwt as _jwt

from tests.constants import *
from tests.factories import FACTORY_LIST


@pytest.fixture(scope="session")
def app(request):
    app = create_app(TestConfig)
    return app


@pytest.fixture(scope="session")
def auth_headers(app):
    base_auth_token = _jwt.create_jwt(BASE_AUTH_CLAIMS, TOKEN_HEADER)
    full_auth_token = _jwt.create_jwt(FULL_AUTH_CLAIMS, TOKEN_HEADER)
    view_only_auth_token = _jwt.create_jwt(
        NRIS_VIEW_ONLY_AUTH_CLAIMS, TOKEN_HEADER)
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


# Fixtures for running an in-memory mocked sqlite db session
@pytest.fixture(scope='session')
def sqlite_app(request):
    """Session-wide test `Flask` application."""
    _app = create_app(EtlTestConfig)

    # Establish an application context before running the tests.
    ctx = _app.app_context()
    ctx.push()

    def teardown():
        ctx.pop()

    request.addfinalizer(teardown)
    return _app

@pytest.fixture(scope='session')
def sqlite_db(sqlite_app, request):
    """Session-wide test database."""

    def teardown():
        db.drop_all()

    db.app = sqlite_app
    db.create_all()

    request.addfinalizer(teardown)
    return db

@pytest.fixture(scope='function')
def sqlite_session(sqlite_db, request):
    """Creates a new database session for a test."""
    connection = sqlite_db.engine.connect()
    transaction = connection.begin()

    options = dict(bind=connection, binds={})
    session = sqlite_db.create_scoped_session(options=options)

    sqlite_db.session = session

    def teardown():
        transaction.rollback()
        connection.close()
        session.remove()

    request.addfinalizer(teardown)
    return session

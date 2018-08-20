from datetime import datetime
import uuid

import pytest
from app import create_app
from app.config import TestConfig
from app.extensions import db, jwt as _jwt
from app.mines.models.mines import MineIdentity, MineDetail, MineralTenureXref
from app.mines.models.person import Person, MgrAppointment

from .constants import *


@pytest.fixture(scope="session")
def app(request):
    app = create_app(TestConfig)
    return app


@pytest.fixture(scope="session")
def jwt(app):
    return _jwt


@pytest.fixture(scope="session")
def auth_headers(app):
    base_auth_token = _jwt.create_jwt(BASE_AUTH_CLAIMS, TOKEN_HEADER)
    full_auth_token = _jwt.create_jwt(FULL_AUTH_CLAIMS, TOKEN_HEADER)
    view_only_auth_token = _jwt.create_jwt(VIEW_ONLY_AUTH_CLAIMS, TOKEN_HEADER)
    return {
        'base_auth_header': {'Authorization': 'Bearer ' + base_auth_token},
        'full_auth_header': {'Authorization': 'Bearer ' + full_auth_token},
        'view_only_auth_header': {'Authorization': 'Bearer ' + view_only_auth_token},
        }


@pytest.fixture(scope='module')
def test_client():
    # Test Setup with data
    app = create_app(TestConfig)
    client = app.test_client()
    ctx = app.app_context()
    ctx.push()
    setup_data()

    yield client

    # Teardown
    clear_data(db.session)
    ctx.pop()


def setup_data():
    # Test Mine Data
    mine_identity = MineIdentity(mine_guid=uuid.UUID(TEST_MINE_GUID), **DUMMY_USER_KWARGS)
    mine_detail = MineDetail(
        mine_guid=uuid.UUID(TEST_MINE_GUID),
        mine_no=TEST_MINE_NO,
        mine_name=TEST_MINE_NAME,
        **DUMMY_USER_KWARGS)
    mine_identity.save()
    mine_detail.save()

    # Test Tenure Data
    tenure = MineralTenureXref(mine_guid=uuid.UUID(TEST_MINE_GUID), tenure_number_id=TEST_TENURE_ID, **DUMMY_USER_KWARGS)
    tenure.save()

    # Test Person Data
    person = Person(
        person_guid=uuid.UUID(TEST_PERSON_GUID),
        first_name=TEST_FIRST_NAME,
        surname=TEST_SURNAME,
        **DUMMY_USER_KWARGS
        )
    person.save()
    person2 = Person(
        person_guid=uuid.UUID(TEST_PERSON_2_GUID),
        first_name=TEST_FIRST_NAME_2,
        surname=TEST_SURNAME_2,
        **DUMMY_USER_KWARGS
        )
    person2.save()
    person3 = Person(
        person_guid=uuid.UUID(TEST_PERSON_3_GUID),
        first_name=TEST_FIRST_NAME_3,
        surname=TEST_SURNAME_3,
        **DUMMY_USER_KWARGS
        )
    person3.save()

    # Test Manager Data
    manager = MgrAppointment(
        mgr_appointment_guid=uuid.UUID(TEST_MANAGER_GUID),
        person_guid=uuid.UUID(TEST_PERSON_GUID),
        mine_guid=uuid.UUID(TEST_MINE_GUID),
        effective_date=datetime.today(),
        expiry_date=datetime.today(),
        **DUMMY_USER_KWARGS
        )
    manager.save()


def clear_data(session):
    meta = db.metadata
    for table in reversed(meta.sorted_tables):
        session.execute(table.delete())
    session.commit()

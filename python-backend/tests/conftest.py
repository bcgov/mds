from datetime import datetime

import pytest
from app import create_app
from app.config import TestConfig
from app.db import db
from app.mines.models.mines import MineIdentity, MineDetail, MineralTenureXref
from app.mines.models.person import Person, MgrAppointment

from .constants import *

@pytest.fixture(scope='module')
def test_client():
    # Test Setup
    app = create_app(TestConfig)
    client = app.test_client()
    ctx = app.app_context()
    ctx.push()

    yield client

    # Teardown
    clear_data(db.session)
    ctx.pop()

@pytest.fixture(scope='module')
def test_client_with_data():
    # Test Setup
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
    mine_identity= MineIdentity(mine_guid = TEST_MINE_GUID, **DUMMY_USER_KWARGS)
    mine_detail = MineDetail(
        mine_guid=TEST_MINE_GUID,
        mine_no=TEST_MINE_NO,
        mine_name=TEST_MINE_NAME,
        **DUMMY_USER_KWARGS)
    mine_identity.save()
    mine_detail.save()

    # Test Person Data
    person=Person(
        person_guid=TEST_PERSON_GUID,
        first_name=TEST_FIRST_NAME,
        surname=TEST_SURNAME,
        **DUMMY_USER_KWARGS
        )
    person.save()

    # Test Manager Data
    manager=MgrAppointment(
        mgr_appointment_guid=TEST_MANAGER_GUID,
        person_guid=TEST_PERSON_GUID,
        mine_guid=TEST_MINE_GUID,
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
from datetime import datetime
import uuid

import pytest
from app import create_app
from app.config import TestConfig
from app.extensions import db, jwt as _jwt
from app.mines.models.mines import MineIdentity, MineDetail, MineralTenureXref
from app.mines.models.person import Person, MgrAppointment
from app.mines.models.location import MineLocation
from app.mines.models.permit import Permit, PermitStatusCode
from .constants import (TEST_MINE_NAME,
                        TEST_MINE_NO,
                        TEST_FIRST_NAME,
                        TEST_SURNAME,
                        TEST_FIRST_NAME_2,
                        TEST_SURNAME_2,
                        TEST_FIRST_NAME_3,
                        TEST_SURNAME_3,
                        TEST_MINE_GUID,
                        TEST_PERSON_GUID,
                        TEST_PERSON_2_GUID,
                        TEST_PERSON_3_GUID,
                        TEST_MANAGER_GUID,
                        TEST_TENURE_ID,
                        DUMMY_USER_KWARGS,
                        TEST_LOCATION_GUID,
                        TEST_LAT_1,
                        TEST_LONG_1,
                        BASE_AUTH_CLAIMS,
                        FULL_AUTH_CLAIMS,
                        VIEW_ONLY_AUTH_CLAIMS,
                        TOKEN_HEADER,
                        TEST_MINE_DETAIL_GUID,
                        TEST_TENURE_GUID,
                        TEST_EMAIL_1,
                        TEST_EMAIL_2,
                        TEST_EMAIL_3,
                        TEST_PHONE_1,
                        TEST_PHONE_2,
                        TEST_PHONE_3,
                        TEST_PERMIT_STATUS_CODE_1,
                        TEST_PERMIT_STATUS_CODE_NAME_1,
                        TEST_PERMIT_GUID_1,
                        TEST_PERMIT_NO_1,
                        TEST_PERMIT_STATUS_CODES
                        )


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


@pytest.fixture(scope="session")
def cli_runner(app):
    runner = app.test_cli_runner()
    return runner


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
    # Clear data
    clear_data(db.session)
    # Test Mine Data
    mine_identity = MineIdentity(mine_guid=uuid.UUID(TEST_MINE_GUID), **DUMMY_USER_KWARGS)
    mine_detail = MineDetail(
        mine_detail_guid=uuid.UUID(TEST_MINE_DETAIL_GUID),
        mine_guid=uuid.UUID(TEST_MINE_GUID),
        mine_no=TEST_MINE_NO,
        mine_name=TEST_MINE_NAME,
        **DUMMY_USER_KWARGS
    )
    mine_identity.save(commit=False)
    mine_detail.save(commit=False)

    # Test Tenure Data
    tenure = MineralTenureXref(
        mineral_tenure_xref_guid=uuid.UUID(TEST_TENURE_GUID),
        mine_guid=uuid.UUID(TEST_MINE_GUID),
        tenure_number_id=TEST_TENURE_ID,
        **DUMMY_USER_KWARGS
    )
    tenure.save(commit=False)

    # Test Location Data
    mine_location = MineLocation(
        mine_location_guid=uuid.UUID(TEST_LOCATION_GUID),
        mine_guid=uuid.UUID(TEST_MINE_GUID),
        latitude=TEST_LAT_1,
        longitude=TEST_LONG_1,
        effective_date=datetime.today(),
        expiry_date=datetime.today(),
        **DUMMY_USER_KWARGS,
    )
    mine_location.save(commit=False)

    # Test Person Data
    person = Person(
        person_guid=uuid.UUID(TEST_PERSON_GUID),
        first_name=TEST_FIRST_NAME,
        surname=TEST_SURNAME,
        email=TEST_EMAIL_1,
        phone_no=TEST_PHONE_1,
        **DUMMY_USER_KWARGS
    )
    person.save(commit=False)
    person2 = Person(
        person_guid=uuid.UUID(TEST_PERSON_2_GUID),
        first_name=TEST_FIRST_NAME_2,
        surname=TEST_SURNAME_2,
        email=TEST_EMAIL_2,
        phone_no=TEST_PHONE_2,
        **DUMMY_USER_KWARGS
    )
    person2.save(commit=False)
    person3 = Person(
        person_guid=uuid.UUID(TEST_PERSON_3_GUID),
        first_name=TEST_FIRST_NAME_3,
        surname=TEST_SURNAME_3,
        email=TEST_EMAIL_3,
        phone_no=TEST_PHONE_3,
        phone_ext='1234',
        **DUMMY_USER_KWARGS
    )
    person3.save(commit=False)

    # Test Manager Data
    manager = MgrAppointment(
        mgr_appointment_guid=uuid.UUID(TEST_MANAGER_GUID),
        person_guid=uuid.UUID(TEST_PERSON_GUID),
        mine_guid=uuid.UUID(TEST_MINE_GUID),
        effective_date=datetime.today(),
        expiry_date=datetime.today(),
        **DUMMY_USER_KWARGS
    )
    manager.save(commit=False)

    # Test Permit Status Codes
    for permit_code_value in TEST_PERMIT_STATUS_CODES:
        permit_code = PermitStatusCode(
            permit_status_code=permit_code_value,
            description=TEST_PERMIT_STATUS_CODE_NAME_1,
            **DUMMY_USER_KWARGS
        )
        permit_code.save(commit=False)

    # Test Permit Data
    permit = Permit(
        permit_guid=TEST_PERMIT_GUID_1,
        mine_guid=TEST_MINE_GUID,
        permit_no=TEST_PERMIT_NO_1,
        permit_status_code=TEST_PERMIT_STATUS_CODE_1,
        received_date=datetime.today(),
        approved_date=datetime.today(),
        **DUMMY_USER_KWARGS
    )
    permit.save(commit=False)
    db.session.commit()


def clear_data(session):
    meta = db.metadata
    for table in reversed(meta.sorted_tables):
        session.execute(table.delete())
    session.commit()

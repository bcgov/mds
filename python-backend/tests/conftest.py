from datetime import datetime
import uuid

import pytest
from app import create_app
from app.config import TestConfig
from app.extensions import db, jwt as _jwt
from app.api.mine.models.mines import MineIdentity, MineDetail, MineralTenureXref
from app.api.status.models.status import MineOperationStatusCode, MineOperationStatusReasonCode, MineOperationStatusSubReasonCode
from app.api.party.models.party import Party, MgrAppointment, PartyTypeCode
from app.api.location.models.location import MineLocation
from app.api.permit.models.permit import Permit, PermitStatusCode
from app.api.permittee.models.permittee import Permittee
from app.api.constants import PARTY_STATUS_CODE, MINE_OPERATION_STATUS, MINE_OPERATION_STATUS_REASON, MINE_OPERATION_STATUS_SUB_REASON
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

    # Test Person Type Codes
    for k, v in PARTY_STATUS_CODE.items():
        party_code = PartyTypeCode(
            party_type_code=v,
            description=v,
            **DUMMY_USER_KWARGS
        )
        party_code.save()

    # Test Operation Codes
    for k, v in MINE_OPERATION_STATUS.items():
        mine_operation_status_code = MineOperationStatusCode(
            mine_operation_status_code=v['value'],
            description=v['label'],
            **DUMMY_USER_KWARGS
        )
        mine_operation_status_code.save()
    for k, v in MINE_OPERATION_STATUS_REASON.items():
        mine_operation_status_reason_code = MineOperationStatusReasonCode(
            mine_operation_status_reason_code=v['value'],
            description=v['label'],
            **DUMMY_USER_KWARGS
        )
        mine_operation_status_reason_code.save()
    for k, v in MINE_OPERATION_STATUS_SUB_REASON.items():
        mine_operation_status_sub_reason_code = MineOperationStatusSubReasonCode(
            mine_operation_status_sub_reason_code=v['value'],
            description=v['label'],
            **DUMMY_USER_KWARGS
        )
        mine_operation_status_sub_reason_code.save()

    # Test Person Data
    person = Party(
        party_guid=uuid.UUID(TEST_PARTY_PER_GUID_1),
        first_name=TEST_PARTY_PER_FIRST_NAME_1,
        party_name=TEST_PARTY_PER_PARTY_NAME_1,
        email=TEST_PARTY_PER_EMAIL_1,
        phone_no=TEST_PARTY_PER_PHONE_1,
        phone_ext=TEST_PARTY_PER_PHONE_EXT_1,
        party_type_code=TEST_PARTY_TYPE,
        **DUMMY_USER_KWARGS
    )
    person.save(commit=False)
    person2 = Party(
        party_guid=uuid.UUID(TEST_PARTY_PER_GUID_2),
        first_name=TEST_PARTY_PER_FIRST_NAME_2,
        party_name=TEST_PARTY_PER_PARTY_NAME_2,
        email=TEST_PARTY_PER_EMAIL_2,
        phone_no=TEST_PARTY_PER_PHONE_2,
        phone_ext=TEST_PARTY_PER_PHONE_EXT_2,
        party_type_code=TEST_PARTY_TYPE,
        **DUMMY_USER_KWARGS
    )
    person2.save(commit=False)
    person3 = Party(
        party_guid=uuid.UUID(TEST_PARTY_PER_GUID_3),
        first_name=TEST_PARTY_PER_FIRST_NAME_3,
        party_name=TEST_PARTY_PER_PARTY_NAME_3,
        email=TEST_PARTY_PER_EMAIL_3,
        phone_no=TEST_PARTY_PER_PHONE_3,
        phone_ext=TEST_PARTY_PER_PHONE_EXT_3,
        party_type_code=TEST_PARTY_TYPE,
        **DUMMY_USER_KWARGS
    )
    person3.save(commit=False)
    party_org = Party(
        party_guid=uuid.UUID(TEST_PARTY_ORG_GUID),
        party_name=TEST_PARTY_ORG_NAME,
        email=TEST_PARTY_ORG_EMAIL,
        phone_no=TEST_PARTY_ORG_PHONE,
        phone_ext=TEST_PARTY_ORG_EXT,
        party_type_code=TEST_ORG_TYPE,
        **DUMMY_USER_KWARGS
    )
    party_org.save(commit=False)
    # Test Manager Data
    manager = MgrAppointment(
        mgr_appointment_guid=uuid.UUID(TEST_MANAGER_GUID),
        party_guid=uuid.UUID(TEST_PARTY_PER_GUID_1),
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
        issue_date=datetime.today(),
        **DUMMY_USER_KWARGS
    )
    permit.save(commit=False)

    # Test Permittee Data
    permittee = Permittee(
        permittee_guid=uuid.UUID(TEST_PERMITTEE_GUID),
        permit_guid=uuid.UUID(TEST_PERMIT_GUID_1),
        party_guid=uuid.UUID(TEST_PARTY_PER_GUID_1),
        **DUMMY_USER_KWARGS
    )
    permittee.save(commit=False)

    db.session.commit()


def clear_data(session):
    meta = db.metadata
    for table in reversed(meta.sorted_tables):
        session.execute(table.delete())
    session.commit()

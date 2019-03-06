from datetime import datetime, timedelta
import uuid

import pytest

from tests.constants import TEST_PERMIT_GUID_1, DUMMY_USER_KWARGS
from app.api.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.permits.permit.models.permit import Permit

from app.extensions import db


@pytest.fixture(scope='function')
def setup_info(test_client):
    permit = Permit.find_by_permit_guid(TEST_PERMIT_GUID_1)

    test_pa = PermitAmendment.create(permit, None, None, None, DUMMY_USER_KWARGS)
    test_pa.save()

    yield {'permit_1': permit, 'permit_amendment_1': test_pa}

    db.session.delete(test_pa)
    try:
        #it may have been deleted by the test that executed, don't freak out.
        db.session.commit()
    except:
        pass


def test_permit_amendment_model_find_by_permit_amendment_id(test_client, auth_headers, setup_info):
    permit_amendment = PermitAmendment.find_by_permit_amendment_id(
        setup_info['permit_amendment_1'].permit_amendment_id)
    assert permit_amendment.permit_amendment_id == setup_info[
        'permit_amendment_1'].permit_amendment_id


def test_permit_amendment_model_find_by_permit_id(test_client, auth_headers, setup_info):
    permit_amendments = PermitAmendment.find_by_permit_id(setup_info['permit_1'].permit_id)
    assert all(pa.permit_id == setup_info['permit_1'].permit_id for pa in permit_amendments)


def test_permit_amendment_model_validate_status_code(test_client, auth_headers, setup_info):
    with pytest.raises(AssertionError) as e:
        PermitAmendment(
            permit_amendment_guid=uuid.uuid4(),
            permit_id=setup_info['permit_1'].permit_id,
            permit_amendment_status_code='',
            permit_amendment_type_code='AM',
            received_date=datetime.today(),
            issue_date=datetime.today(),
            authorization_end_date=datetime.today())
    assert 'Permit amendment status code is not provided.' in str(e.value)


def test_permit_amendment_model_validate_type_code(test_client, auth_headers, setup_info):
    with pytest.raises(AssertionError) as e:
        PermitAmendment(
            permit_amendment_guid=uuid.uuid4(),
            permit_id=setup_info['permit_1'].permit_id,
            permit_amendment_status_code='A',
            permit_amendment_type_code='',
            received_date=datetime.today(),
            issue_date=datetime.today(),
            authorization_end_date=datetime.today())
    assert 'Permit amendment type code is not provided.' in str(e.value)


def test_permit_model_validate_received_date(test_client, auth_headers, setup_info):
    with pytest.raises(AssertionError) as e:
        PermitAmendment(
            permit_amendment_guid=uuid.uuid4(),
            permit_id=setup_info['permit_1'].permit_id,
            permit_amendment_status_code='A',
            permit_amendment_type_code='AM',
            received_date=datetime.today() + timedelta(days=1),
            issue_date=datetime.today(),
            authorization_end_date=datetime.today())
    assert 'Permit amendment received date cannot be set to the future.' in str(e.value)


def test_permit_model_validate_issue_date(test_client, auth_headers, setup_info):
    with pytest.raises(AssertionError) as e:
        PermitAmendment(
            permit_amendment_guid=uuid.uuid4(),
            permit_id=setup_info['permit_1'].permit_id,
            permit_amendment_status_code='A',
            permit_amendment_type_code='AM',
            received_date=datetime.today(),
            issue_date=datetime.today() + timedelta(days=1),
            authorization_end_date=datetime.today())
    assert 'Permit amendment issue date cannot be set to the future.' in str(e.value)

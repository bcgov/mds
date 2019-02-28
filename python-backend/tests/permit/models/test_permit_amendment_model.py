from datetime import datetime, timedelta
import uuid

import pytest

from tests.constants import TEST_PERMIT_AMENDMENT_ID_1, TEST_PERMIT_ID_1
from app.api.permits.permit_amendment.models.permit_amendment import PermitAmendment


def test_permit_amendment_model_find_by_permit_amendment_id(test_client, auth_headers):
    permit_amendment = PermitAmendment.find_by_permit_amendment_id(TEST_PERMIT_AMENDMENT_ID_1)
    assert str(permit_amendment.permit_amendment_id) == TEST_PERMIT_AMENDMENT_ID_1


def test_permit_amendment_model_find_by_permit_id(test_client, auth_headers):
    permit_amendments = PermitAmendment.find_by_permit_id(TEST_PERMIT_ID_1)
    assert str(permit_amendments[0].permit_id) == TEST_PERMIT_ID_1


def test_permit_amendment_model_validate_status_code(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        PermitAmendment(
            permit_amendment_id=1,
            permit_amendment_guid=uuid.uuid4(),
            permit_id=1,
            permit_amendment_status_code='',
            permit_amendment_type_code='AM',
            received_date=datetime.today(),
            issue_date=datetime.today(),
            authorization_end_date=datetime.today())
    assert 'Permit amendment status code is not provided.' in str(e.value)


def test_permit_amendment_model_validate_type_code(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        PermitAmendment(
            permit_amendment_id=1,
            permit_amendment_guid=uuid.uuid4(),
            permit_id=1,
            permit_amendment_status_code='A',
            permit_amendment_type_code='',
            received_date=datetime.today(),
            issue_date=datetime.today(),
            authorization_end_date=datetime.today())
    assert 'Permit amendment type code is not provided.' in str(e.value)


def test_permit_model_validate_received_date(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        PermitAmendment(
            permit_amendment_id=1,
            permit_amendment_guid=uuid.uuid4(),
            permit_id=1,
            permit_amendment_status_code='A',
            permit_amendment_type_code='AM',
            received_date=datetime.today() + timedelta(days=1),
            issue_date=datetime.today(),
            authorization_end_date=datetime.today())
    assert 'Permit amendment received date cannot be set to the future.' in str(e.value)


def test_permit_model_validate_issue_date(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        PermitAmendment(
            permit_amendment_id=1,
            permit_amendment_guid=uuid.uuid4(),
            permit_id=1,
            permit_amendment_status_code='A',
            permit_amendment_type_code='AM',
            received_date=datetime.today(),
            issue_date=datetime.today() + timedelta(days=1),
            authorization_end_date=datetime.today())
    assert 'Permit amendment issue date cannot be set to the future.' in str(e.value)

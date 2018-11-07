from datetime import datetime, timedelta
import uuid

import pytest

from tests.constants import TEST_PERMIT_GUID_1, TEST_MINE_GUID
from app.api.permits.permit.models.permit import Permit


# Permit Model Class Methods
def test_permit_model_find_by_permit_guid(test_client, auth_headers):
    permit = Permit.find_by_permit_guid(TEST_PERMIT_GUID_1)
    assert str(permit.permit_guid) == TEST_PERMIT_GUID_1


def test_permit_model_find_by_mine_guid(test_client, auth_headers):
    permit = Permit.find_by_mine_guid(TEST_MINE_GUID)
    assert str(permit[0].mine_guid) == TEST_MINE_GUID


def test_permit_model_validate_status_code(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        Permit(
            permit_guid=uuid.uuid4(),
            mine_guid=uuid.uuid4(),
            permit_no=''.join(['{}'.format(x) for x in range(11)]),
            permit_status_code='',
            received_date=datetime.today(),
            issue_date=datetime.today()
        )
    assert 'Permit status code is not provided.' in str(e.value)


def test_permit_model_validate_permit_no(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        Permit(
            permit_guid=uuid.uuid4(),
            mine_guid=uuid.uuid4(),
            permit_no='',
            permit_status_code='O',
            received_date=datetime.today(),
            issue_date=datetime.today()
        )
    assert 'Permit number is not provided.' in str(e.value)


def test_permit_model_validate_permit_no_max_char(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        Permit(
            permit_guid=uuid.uuid4(),
            mine_guid=uuid.uuid4(),
            permit_no=''.join(['{}'.format(x) for x in range(17)]),
            permit_status_code='O',
            received_date=datetime.today(),
            issue_date=datetime.today()
        )
    assert 'Permit number must not exceed 16 characters.' in str(e.value)


def test_permit_model_validate_received_date(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        Permit(
            permit_guid=uuid.uuid4(),
            mine_guid=uuid.uuid4(),
            permit_no=''.join(['{}'.format(x) for x in range(7)]),
            permit_status_code='O',
            received_date=datetime.today() + timedelta(days=1),
            issue_date=datetime.today()
        )
    assert 'Permit received date cannot be set to the future.' in str(e.value)


def test_permit_model_validate_issue_date(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        Permit(
            permit_guid=uuid.uuid4(),
            mine_guid=uuid.uuid4(),
            permit_no=''.join(['{}'.format(x) for x in range(7)]),
            permit_status_code='O',
            received_date=datetime.today(),
            issue_date=datetime.today() + timedelta(days=1)
        )
    assert 'Permit issue date cannot be set to the future.' in str(e.value)

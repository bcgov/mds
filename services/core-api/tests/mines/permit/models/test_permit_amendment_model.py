from datetime import datetime, timedelta
import uuid

import pytest

from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from tests.factories import PermitFactory


def test_permit_amendment_model_find_by_permit_amendment_id(db_session):
    permit = PermitFactory(permit_amendments=1)

    permit_amendment = PermitAmendment.find_by_permit_amendment_id(
        permit.permit_amendments[0].permit_amendment_id)
    assert permit_amendment.permit_amendment_id == permit.permit_amendments[0].permit_amendment_id


def test_permit_amendment_model_find_by_permit_id(db_session):
    batch_size = 3
    permit_id = PermitFactory(permit_amendments=batch_size).permit_id

    permit_amendments = PermitAmendment.find_by_permit_id(permit_id)
    assert len(permit_amendments) == batch_size
    assert all(pa.permit_id == permit_id for pa in permit_amendments)


def test_permit_amendment_model_validate_status_code():
    with pytest.raises(AssertionError) as e:
        PermitAmendment(
            permit_amendment_guid=uuid.uuid4(),
            permit_id=0,
            permit_amendment_status_code='',
            permit_amendment_type_code='AM',
            received_date=datetime.today(),
            issue_date=datetime.today(),
            authorization_end_date=datetime.today())
    assert 'Permit amendment status code is not provided.' in str(e.value)


def test_permit_amendment_model_validate_type_code():
    with pytest.raises(AssertionError) as e:
        PermitAmendment(
            permit_amendment_guid=uuid.uuid4(),
            permit_id=0,
            permit_amendment_status_code='A',
            permit_amendment_type_code='',
            received_date=datetime.today(),
            issue_date=datetime.today(),
            authorization_end_date=datetime.today())
    assert 'Permit amendment type code is not provided.' in str(e.value)


def test_permit_model_validate_received_date():
    with pytest.raises(AssertionError) as e:
        PermitAmendment(
            permit_amendment_guid=uuid.uuid4(),
            permit_id=0,
            permit_amendment_status_code='A',
            permit_amendment_type_code='AM',
            received_date=datetime.today() + timedelta(days=1),
            issue_date=datetime.today(),
            authorization_end_date=datetime.today())
    assert 'Permit amendment received date cannot be set to the future.' in str(e.value)


def test_permit_model_validate_issue_date(db_session):
    with pytest.raises(AssertionError) as e:
        PermitAmendment(
            permit_amendment_guid=uuid.uuid4(),
            permit_id=0,
            permit_amendment_status_code='A',
            permit_amendment_type_code='AM',
            received_date=datetime.today(),
            issue_date=datetime.today() + timedelta(days=1),
            authorization_end_date=datetime.today())
    assert 'Permit amendment issue date cannot be set to the future.' in str(e.value)

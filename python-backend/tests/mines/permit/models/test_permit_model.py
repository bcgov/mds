from datetime import datetime
import uuid
import pytest

from app.api.mines.permits.permit.models.permit import Permit
from tests.factories import PermitFactory, MineFactory


# Permit Model Class Methods
def test_permit_model_find_by_permit_guid(db_session):
    permit_guid = PermitFactory().permit_guid

    permit = Permit.find_by_permit_guid(str(permit_guid))
    assert permit.permit_guid == permit_guid


def test_permit_model_find_by_mine_guid(db_session):
    mine_guid = MineFactory(mine_permit=1).mine_guid

    permits = Permit.find_by_mine_guid(str(mine_guid))
    assert permits[0].mine_guid == mine_guid


def test_permit_model_validate_status_code():
    with pytest.raises(AssertionError) as e:
        Permit(
            permit_guid=uuid.uuid4(),
            mine_guid=uuid.uuid4(),
            permit_no='6' * 11,
            permit_status_code='',
            received_date=datetime.today(),
            issue_date=datetime.today())
    assert 'Permit status code is not provided.' in str(e.value)


def test_permit_model_validate_permit_no():
    with pytest.raises(AssertionError) as e:
        Permit(
            permit_guid=uuid.uuid4(),
            mine_guid=uuid.uuid4(),
            permit_no='',
            permit_status_code='O',
            received_date=datetime.today(),
            issue_date=datetime.today())
    assert 'Permit number is not provided.' in str(e.value)


def test_permit_model_validate_permit_no_max_char():
    with pytest.raises(AssertionError) as e:
        Permit(
            permit_guid=uuid.uuid4(),
            mine_guid=uuid.uuid4(),
            permit_no='6' * 17,
            permit_status_code='O',
            received_date=datetime.today(),
            issue_date=datetime.today())
    assert 'Permit number must not exceed 16 characters.' in str(e.value)

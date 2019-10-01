import pytest

from app.api.constants import MINE_OPERATION_STATUS, MINE_OPERATION_STATUS_REASON, MINE_OPERATION_STATUS_SUB_REASON
from app.api.mines.status.models.mine_operation_status_code import MineOperationStatusCode
from app.api.mines.status.models.mine_operation_status_reason_code import MineOperationStatusReasonCode
from app.api.mines.status.models.mine_operation_status_sub_reason_code import MineOperationStatusSubReasonCode


# MineOperationStatusCode Model
def test_mine_operation_status_code_find_by_mine_operation_status_code(db_session):
    mine_operation_status_code = MineOperationStatusCode.find_by_mine_operation_status_code(MINE_OPERATION_STATUS['closed']['value'])
    assert mine_operation_status_code.mine_operation_status_code == MINE_OPERATION_STATUS['closed']['value']


def test_mine_operation_status_code_validate_mine_operation_status_code_not_provided():
    with pytest.raises(AssertionError) as e:
        MineOperationStatusCode(
            mine_operation_status_code='',
            description='test_description',
            display_order=1
        )
    assert 'Mine operation status code is not provided.' in str(e.value)


def test_mine_operation_status_code_validate_mine_operation_status_code_max_char():
    with pytest.raises(AssertionError) as e:
        MineOperationStatusCode(
            mine_operation_status_code='1234',
            description='test_description',
            display_order=1
        )
    assert 'Mine operation status code must not exceed 3 characters.' in str(e.value)


def test_mine_operation_status_code_validate_description_not_provided():
    with pytest.raises(AssertionError) as e:
        MineOperationStatusCode(
            mine_operation_status_code='123',
            description='',
            display_order=1
        )
    assert 'Mine operation status code description is not provided.' in str(e.value)


def test_mine_operation_status_code_validate_description_max_char():
    with pytest.raises(AssertionError) as e:
        MineOperationStatusCode(
            mine_operation_status_code='123',
            description='a' * 101,
            display_order=1
        )
    assert 'Mine operation status code description must not exceed 100 characters.' in str(e.value)


# MineOperationStatusReasonCode
def test_mine_operation_status_reason_code_find_by_mine_operation_status_reason_code(db_session):
    mine_operation_status_reason_code = MineOperationStatusReasonCode.find_by_mine_operation_status_reason_code(MINE_OPERATION_STATUS_REASON['reclamation']['value'])
    assert mine_operation_status_reason_code.mine_operation_status_reason_code == MINE_OPERATION_STATUS_REASON['reclamation']['value']


def test_mine_operation_status_code_validate_mine_operation_status_reason_code_not_provided():
    with pytest.raises(AssertionError) as e:
        MineOperationStatusReasonCode(
            mine_operation_status_reason_code='',
            description='test_description',
            display_order=1
        )
    assert 'Mine operation status reason code is not provided.' in str(e.value)


def test_mine_operation_status_code_validate_mine_operation_status_reason_code_max_char():
    with pytest.raises(AssertionError) as e:
        MineOperationStatusReasonCode(
            mine_operation_status_reason_code='1234',
            description='test_description',
            display_order=1
        )
    assert 'Mine operation status reason code must not exceed 3 characters.' in str(e.value)


def test_mine_operation_status_reason_code_validate_description_not_provided():
    with pytest.raises(AssertionError) as e:
        MineOperationStatusReasonCode(
            mine_operation_status_reason_code='123',
            description='',
            display_order=1
        )
    assert 'Mine operation status reason code description is not provided.' in str(e.value)


def test_mine_operation_status_reason_code_validate_description_max_char():
    with pytest.raises(AssertionError) as e:
        MineOperationStatusReasonCode(
            mine_operation_status_reason_code='123',
            description='a'*101,
            display_order=1
        )
    assert 'Mine operation status reason code description must not exceed 100 characters.' in str(e.value)


# MineOperationStatusSubReasonCode
def test_mine_operation_status_reason_code_find_by_mine_operation_status_sub_reason_code(db_session):
    mine_operation_status_sub_reason_code = MineOperationStatusSubReasonCode.find_by_mine_operation_status_sub_reason_code(MINE_OPERATION_STATUS_SUB_REASON['long_term_maintenance']['value'])
    assert mine_operation_status_sub_reason_code.mine_operation_status_sub_reason_code == MINE_OPERATION_STATUS_SUB_REASON['long_term_maintenance']['value']


def test_mine_operation_status_code_validate_mine_operation_status_sub_reason_code_not_provided():
    with pytest.raises(AssertionError) as e:
        MineOperationStatusSubReasonCode(
            mine_operation_status_sub_reason_code='',
            description='test_description',
            display_order=1
        )
    assert 'Mine operation status sub reason code is not provided.' in str(e.value)


def test_mine_operation_status_code_validate_mine_operation_status_sub_reason_code_max_char():
    with pytest.raises(AssertionError) as e:
        MineOperationStatusSubReasonCode(
            mine_operation_status_sub_reason_code='1234',
            description='test_description',
            display_order=1
        )
    assert 'Mine operation status sub reason code must not exceed 3 characters.' in str(e.value)


def test_mine_operation_status_sub_reason_code_validate_description_not_provided():
    with pytest.raises(AssertionError) as e:
        MineOperationStatusSubReasonCode(
            mine_operation_status_sub_reason_code='123',
            description='',
            display_order=1
        )
    assert 'Mine operation status sub reason code description is not provided.' in str(e.value)


def test_mine_operation_status_sub_reason_code_validate_description_max_char():
    with pytest.raises(AssertionError) as e:
        MineOperationStatusSubReasonCode(
            mine_operation_status_sub_reason_code='123',
            description='a' * 101,
            display_order=1
        )
    assert 'Mine operation status sub reason code description must not exceed 100 characters.' in str(e.value)

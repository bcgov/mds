import uuid

import pytest

from tests.constants import TEST_MINE_NO
from app.api.mines.mine.models.mine import MineDetail


# MineDetail Class Methods
def test_mine_detail_model_find_by_no(test_client, auth_headers):
    mine_detail = MineDetail.find_by_mine_no(TEST_MINE_NO)
    assert str(mine_detail.mine_no) == TEST_MINE_NO


def test_mine_detai_model_validate_mine_name(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        MineDetail(
            mine_detail_guid=uuid.uuid4(),
            mine_guid=uuid.uuid4(),
            mine_no='123456789',
            mine_name='',
        )
    assert 'No mine name provided.' in str(e.value)


def test_mine_detai_model_validate_mine_name_max_char(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        MineDetail(
            mine_detail_guid=uuid.uuid4(),
            mine_guid=uuid.uuid4(),
            mine_no='123456789',
            mine_name=''.join(['{}'.format(x) for x in range(60)]),
        )
    assert 'Mine name must not exceed 60 characters.' in str(e.value)


def test_mine_detai_model_validate_mine_note(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        MineDetail(
            mine_detail_guid=uuid.uuid4(),
            mine_guid=uuid.uuid4(),
            mine_no='123456789',
            mine_name='test_name',
            mine_note=''.join(['{}'.format(x) for x in range(301)])
        )
    assert 'Mine note must not exceed 300 characters.' in str(e.value)


def test_mine_detai_model_validate_mine_no(test_client, auth_headers):
    with pytest.raises(AssertionError) as e:
        MineDetail(
            mine_detail_guid=uuid.uuid4(),
            mine_guid=uuid.uuid4(),
            mine_no=''.join(['{}'.format(x) for x in range(11)]),
            mine_name='test_name'
        )
    assert 'Mine number must not exceed 10 characters.' in str(e.value)

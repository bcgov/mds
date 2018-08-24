import json
from ..constants import *
from app.mines.models.mines import MineIdentity, MineDetail, MineralTenureXref


# MineIdentity Model Class Methods
def test_mine_model_find_by_mine_guid(test_client, auth_headers):
    mine = MineIdentity.find_by_mine_guid(TEST_MINE_GUID)
    assert str(mine.mine_guid) == TEST_MINE_GUID


def test_mine_model_find_by_mine_guid_fail(test_client, auth_headers):
    mine = MineIdentity.find_by_mine_guid('jflkjfsdl')
    assert mine == None


def test_mine_model_find_by_mine_no(test_client, auth_headers):
    mine = MineIdentity.find_by_mine_no(TEST_MINE_NO)
    assert str(mine.mine_detail[0].mine_no) == TEST_MINE_NO


# MineDetail Class Methods
def test_mine_detail_model_find_by_no(test_client, auth_headers):
    mine_detail = MineDetail.find_by_mine_no(TEST_MINE_NO)
    assert str(mine_detail.mine_no) == TEST_MINE_NO


# MineralTenureXref Class Methods
def test_mineral_tenure_xref_detail_model_find_by_tenure(test_client, auth_headers):
    tenure = MineralTenureXref.find_by_tenure(TEST_TENURE_ID)
    assert str(tenure.tenure_number_id) == TEST_TENURE_ID
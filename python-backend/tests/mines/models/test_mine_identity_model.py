from tests.constants import TEST_MINE_GUID, TEST_MINE_NO
from app.mines.models.mines import MineIdentity


# MineIdentity Model Class Methods
def test_mine_model_find_by_mine_guid(test_client, auth_headers):
    mine = MineIdentity.find_by_mine_guid(TEST_MINE_GUID)
    assert str(mine.mine_guid) == TEST_MINE_GUID


def test_mine_model_find_by_mine_guid_fail(test_client, auth_headers):
    mine = MineIdentity.find_by_mine_guid('jflkjfsdl')
    assert mine is None


def test_mine_model_find_by_mine_no(test_client, auth_headers):
    mine = MineIdentity.find_by_mine_no(TEST_MINE_NO)
    assert str(mine.mine_detail[0].mine_no) == TEST_MINE_NO

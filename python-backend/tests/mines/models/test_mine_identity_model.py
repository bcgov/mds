from tests.constants import TEST_MINE_GUID, TEST_MINE_NO
from app.api.mines.mine.models.mine_identity import MineIdentity


# MineIdentity Model Class Methods
def test_mine_model_find_by_mine_guid(test_client, auth_headers):
    mine = MineIdentity.find_by_mine_guid(TEST_MINE_GUID)
    assert str(mine.mine_guid) == TEST_MINE_GUID


def test_mine_model_find_by_mine_guid_fail(test_client, auth_headers):
    mine = MineIdentity.find_by_mine_guid('jflkjfsdl')
    assert mine is None


def test_mine_model_find_by_mine_no(test_client, auth_headers):
    mine = MineIdentity.find_by_mine_no(TEST_MINE_NO)
    assert str(mine.mine_no) == TEST_MINE_NO


def test_mine_model_find_by_mine_no_or_guid(test_client, auth_headers):
    mine = MineIdentity.find_by_mine_no_or_guid(TEST_MINE_NO)
    assert str(mine.mine_no) == TEST_MINE_NO

    mine = MineIdentity.find_by_mine_no_or_guid(TEST_MINE_GUID)
    assert str(mine.mine_guid) == TEST_MINE_GUID

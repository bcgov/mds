from tests.constants import TEST_MINE_NO
from app.mines.models.mines import MineDetail


# MineDetail Class Methods
def test_mine_detail_model_find_by_no(test_client, auth_headers):
    mine_detail = MineDetail.find_by_mine_no(TEST_MINE_NO)
    assert str(mine_detail.mine_no) == TEST_MINE_NO

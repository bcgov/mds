from app.api.mines.mine.models.mine import Mine
from tests.factories import MineFactory


# Mine Model Class Methods
def test_mine_model_find_by_mine_guid(db_session):
    init_mine_guid = MineFactory().mine_guid

    mine = Mine.find_by_mine_guid(str(init_mine_guid))
    assert mine.mine_guid == init_mine_guid


def test_mine_model_find_by_mine_guid_fail(db_session):
    init_mine = MineFactory()

    mine = Mine.find_by_mine_guid('jflkjfsdl')
    assert mine is None


def test_mine_model_find_by_mine_no(db_session):
    init_mine_no = MineFactory().mine_no

    mine = Mine.find_by_mine_no(init_mine_no)
    assert mine.mine_no == init_mine_no


def test_mine_model_find_by_mine_no_or_guid(db_session):
    init_mine = MineFactory()

    mine = Mine.find_by_mine_no_or_guid(init_mine.mine_no)
    assert mine.mine_no == init_mine.mine_no

    mine = Mine.find_by_mine_no_or_guid(str(init_mine.mine_guid))
    assert mine.mine_guid == init_mine.mine_guid

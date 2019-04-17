from tests.factories import MineFactory, MineLocationFactory
from app.api.mines.location.models.mine_location import MineLocation


# MineLocation Class Methods
def test_mine_location_find_by_mine_guid(db_session, auth_headers):
    mine_guid = MineFactory().mine_guid

    mine_location = MineLocation.find_by_mine_guid(str(mine_guid))
    assert mine_location.mine_guid == mine_guid


def test_mine_location_find_by_location_guid(db_session, auth_headers):
    loc_guid = MineLocationFactory().mine_location_guid

    mine_location = MineLocation.find_by_mine_location_guid(str(loc_guid))
    assert mine_location.mine_location_guid == loc_guid

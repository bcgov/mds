from tests.constants import TEST_MINE_GUID, TEST_LOCATION_GUID
from app.api.location.models.location import MineLocation


# MineLocation Class Methods
def test_mine_location_find_by_mine_guid(test_client, auth_headers):
    mine_location = MineLocation.find_by_mine_guid(TEST_MINE_GUID)
    assert str(mine_location.mine_guid) == TEST_MINE_GUID


def test_mine_location_find_by_location_guid(test_client, auth_headers):
    mine_location = MineLocation.find_by_mine_location_guid(TEST_LOCATION_GUID)
    assert str(mine_location.mine_location_guid) == TEST_LOCATION_GUID

from tests.constants import TEST_REGION_GUID, TEST_REGION_CODE_1
from app.api.mines.region.models.region import MineRegion


# MineLocation Class Methods
def test_mine_region_find_by_mine_region_guid(test_client, auth_headers):
    mine_region = MineRegion.find_by_mine_region_guid(TEST_REGION_GUID)
    assert str(mine_region.mine_region_guid) == TEST_REGION_GUID

 
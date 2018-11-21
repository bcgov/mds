from tests.constants import TEST_REGION_CODE,TEST_REGION_DESCRIPTION
from app.api.mines.region.models.region import MineRegionCode


# MineLocation Class Methods
def test_mine_region_find_by_region_code(test_client, auth_headers):
    mine_region = MineRegionCode.find_by_region_code(TEST_REGION_CODE)
    assert str(mine_region.description) == TEST_REGION_DESCRIPTION

 
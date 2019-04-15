from app.api.mines.region.models.region import MineRegionCode
from tests.status_code_gen import RandomMineRegionCode

# MineLocation Class Methods
def test_mine_region_find_by_region_code(db_session):
    region_code = RandomMineRegionCode()

    mine_region = MineRegionCode.find_by_region_code(region_code)
    assert mine_region.mine_region_code == region_code

 
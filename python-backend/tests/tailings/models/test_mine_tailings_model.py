import uuid
from tests.constants import TEST_MINE_GUID, TEST_TAILINGS_STORAGE_FACILITY_GUID1
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility

# MineExpectedDocument Class Methods
def test_mine_tailings_find_by_tsf_guid(test_client, auth_headers):
    tsf = MineTailingsStorageFacility.find_by_tsf_guid(TEST_TAILINGS_STORAGE_FACILITY_GUID1)
    assert str(tsf.mine_tailings_storage_facility_guid) == TEST_TAILINGS_STORAGE_FACILITY_GUID1

def test_mine_tailings_find_by_mine_guid(test_client, auth_headers):
    mine_tsfs = MineTailingsStorageFacility.find_by_mine_guid(TEST_MINE_GUID)
    assert all(str(tsf.mine_guid) == TEST_MINE_GUID for tsf in mine_tsfs)
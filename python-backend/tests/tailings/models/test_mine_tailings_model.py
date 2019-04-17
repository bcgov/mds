import uuid, pytest
from tests.factories import MineFactory, MineTailingsStorageFacilityFactory
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility


def test_mine_tailings_find_by_tsf_guid(db_session):
    tsf_guid = MineTailingsStorageFacilityFactory().mine_tailings_storage_facility_guid

    tsf = MineTailingsStorageFacility.find_by_tsf_guid(str(tsf_guid))
    assert tsf.mine_tailings_storage_facility_guid == tsf_guid


def test_mine_tailings_find_by_mine_guid(db_session):
    batch_size = 2
    mine_guid = MineFactory(mine_tailings_storage_facilities=batch_size).mine_guid

    mine_tsfs = MineTailingsStorageFacility.find_by_mine_guid(str(mine_guid))
    assert len(mine_tsfs) == batch_size
    assert all(tsf.mine_guid == mine_guid for tsf in mine_tsfs)
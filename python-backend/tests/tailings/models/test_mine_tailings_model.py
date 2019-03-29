import uuid, pytest
from tests.constants import TEST_MINE_GUID
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility
from app.extensions import db


@pytest.fixture(scope="function")
def setup_info(test_client):
    mine_tsf1 = MineTailingsStorageFacility.create(
        mine_guid=TEST_MINE_GUID, tailings_facility_name='Tailings Facility 1')
    mine_tsf1.save()

    yield dict(tsf1=mine_tsf1)
    db.session.delete(mine_tsf1)
    db.session.commit()


# MineExpectedDocument Class Methods
def test_mine_tailings_find_by_tsf_guid(test_client, auth_headers, setup_info):
    tsf = MineTailingsStorageFacility.find_by_tsf_guid(
        setup_info['tsf1'].mine_tailings_storage_facility_guid)
    assert tsf.mine_tailings_storage_facility_guid == setup_info[
        'tsf1'].mine_tailings_storage_facility_guid


def test_mine_tailings_find_by_mine_guid(test_client, auth_headers, setup_info):
    mine_tsfs = MineTailingsStorageFacility.find_by_mine_guid(setup_info['tsf1'].mine_guid)
    assert all(tsf.mine_guid == setup_info['tsf1'].mine_guid for tsf in mine_tsfs)
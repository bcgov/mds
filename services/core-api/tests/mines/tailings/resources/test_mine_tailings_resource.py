import json
import uuid

from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from tests.factories import MineFactory, MineTailingsStorageFacilityFactory


def test_get_mine_tailings_storage_facility_by_mine_guid(test_client, db_session, auth_headers):
    tsf = MineTailingsStorageFacilityFactory()

    get_resp = test_client.get(
        f'/mines/{tsf.mine_guid}/tailings', headers=auth_headers['full_auth_header'])
    get_data = json.loads(get_resp.data.decode())
    assert get_resp.status_code == 200, get_resp.response
    assert len(get_data['mine_tailings_storage_facilities']) == 1


def test_post_mine_tailings_storage_facility_by_mine_guid(test_client, db_session, auth_headers):
    mine = MineFactory()
    org_mine_tsf_list_len = len(mine.mine_tailings_storage_facilities)
    data = {
        'mine_tailings_storage_facility_name': 'a name',
        'latitude': '50.6598000',
        'longitude': '-120.5134000',
        'consequence_classification_status_code': 'LOW',
        'tsf_operating_status_code': 'OPT',
        'itrb_exemption_status_code': 'YES',
        'storage_location': 'above_ground',
        'facility_type': 'tailings_storage_facility',
        'tailings_storage_facility_type': 'pit',
        'mines_act_permit_no': 'xxx',
    }

    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/tailings', data=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 201
    assert len(mine.mine_tailings_storage_facilities) == org_mine_tsf_list_len + 1


def test_post_first_mine_tailings_storage_facility_by_mine_guid(test_client, db_session,
                                                                auth_headers):
    mine = MineFactory(minimal=True)
    data = {
        'mine_tailings_storage_facility_name': 'a name',
        'latitude': '50.6598000',
        'longitude': '-120.5134000',
        'consequence_classification_status_code': 'LOW',
        'tsf_operating_status_code': 'OPT',
        'itrb_exemption_status_code': 'YES',
        'storage_location': 'above_ground',
        'facility_type': 'tailings_storage_facility',
        'tailings_storage_facility_type': 'pit',
        'mines_act_permit_no': 'xxx',
    }
    assert len(mine.mine_tailings_storage_facilities) == 0

    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/tailings', data=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 201
    assert len(mine.mine_tailings_storage_facilities) == 1


def test_post_first_mine_tailings_storage_facility_by_mine_guid_creates_tsf_required_reports(
        test_client, db_session, auth_headers):
    mine = MineFactory(minimal=True)
    data = {
        'mine_tailings_storage_facility_name': 'a name',
        'latitude': '50.6598000',
        'longitude': '-120.5134000',
        'consequence_classification_status_code': 'LOW',
        'tsf_operating_status_code': 'OPT',
        'itrb_exemption_status_code': 'YES',
        'storage_location': 'above_ground',
        'facility_type': 'tailings_storage_facility',
        'tailings_storage_facility_type': 'pit',
        'mines_act_permit_no': 'xxx',
    }
    assert len(mine.mine_tailings_storage_facilities) == 0

    post_resp = test_client.post(
        f'/mines/{mine.mine_guid}/tailings', data=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 201
    tsf_required_reports = MineReportDefinition.find_required_reports_by_category('TSF')
    assert len(mine.mine_reports) == len(tsf_required_reports)


def test_put_tailings_storage_facility_not_found(test_client, db_session, auth_headers):
    tsf_updated = MineTailingsStorageFacilityFactory()

    data = {
        'mine_tailings_storage_facility_name': tsf_updated.mine_tailings_storage_facility_name,
        'latitude': tsf_updated.latitude,
        'longitude': tsf_updated.longitude,
        'consequence_classification_status_code':
            tsf_updated.consequence_classification_status_code,
        'tsf_operating_status_code': tsf_updated.tsf_operating_status_code,
        'itrb_exemption_status_code': tsf_updated.itrb_exemption_status_code,
        'storage_location': 'above_ground',
        'facility_type': 'tailings_storage_facility',
        'tailings_storage_facility_type': 'pit',
        'mines_act_permit_no': 'xxx',
    }

    put_resp = test_client.put(
        f'/mines/{uuid.uuid4()}/tailings/{uuid.uuid4()}',
        data=data,
        headers=auth_headers['full_auth_header'])
    put_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 404


def test_put_tailings_storage_facility_success(test_client, db_session, auth_headers):
    tsf = MineTailingsStorageFacilityFactory()
    tsf_updated = MineTailingsStorageFacilityFactory()

    data = {
        'mine_tailings_storage_facility_name': tsf_updated.mine_tailings_storage_facility_name,
        'latitude': tsf_updated.latitude,
        'longitude': tsf_updated.longitude,
        'consequence_classification_status_code':
            tsf_updated.consequence_classification_status_code,
        'tsf_operating_status_code': tsf_updated.tsf_operating_status_code,
        'itrb_exemption_status_code': tsf_updated.itrb_exemption_status_code,
        'storage_location': 'above_ground',
        'facility_type': 'tailings_storage_facility',
        'tailings_storage_facility_type': 'pit',
        'mines_act_permit_no': 'xxx',
    }

    put_resp = test_client.put(
        f'/mines/{tsf.mine.mine_guid}/tailings/{tsf.mine_tailings_storage_facility_guid}',
        data=data,
        headers=auth_headers['full_auth_header'])

    put_data = json.loads(put_resp.data.decode())

    assert put_resp.status_code == 200
    assert put_data['mine_tailings_storage_facility_name'] == data[
        'mine_tailings_storage_facility_name']
    assert put_data['consequence_classification_status_code'] == data[
        'consequence_classification_status_code']
    assert put_data['tsf_operating_status_code'] == data['tsf_operating_status_code']
    assert put_data['itrb_exemption_status_code'] == data['itrb_exemption_status_code']

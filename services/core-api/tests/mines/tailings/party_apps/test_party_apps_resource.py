import uuid
import json
from app.extensions import db
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.reports.models.mine_report import MineReport
from tests.factories import MineFactory, MineTailingsStorageFacilityFactory


def test_post_mine_tailings_storage_facility_by_mine_guid(test_client, db_session, auth_headers):
    """Should create an EOR record and return a 200 response"""

    tsf = MineTailingsStorageFacilityFactory()

    org_mine_tsf_list_len = len(tsf.engineer_of_records)
    data = {
        'party_name': 'LastName',
        'phone_no': '240-359-2232',
        'last_name': 'A name',
        'first_name': 'A first name',
        'email': 'test@email.com',
        'address_line_1': 'Addr1',
        'address_line_2': 'Addr2',
        'city': 'Victoria',
        'sub_division_code': 'BC',
        'post_code': 'V4D1B3',
    }

    post_resp = test_client.post(
        f'/mines/{tsf.mine.mine_guid}/tailings/{tsf.mine_tailings_storage_facility_guid}/party_appt', data=data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200
    assert len(tsf.engineer_of_records) == org_mine_tsf_list_len + 1

    assert tsf.engineer_of_record.party.party_name == 'LastName'

def test_post_mine_tailings_storage_facility_by_mine_guid_should_update_current_eor(test_client, db_session, auth_headers):
    """Should create two EOR records and set the active one to the last created"""

    tsf = MineTailingsStorageFacilityFactory()

    org_mine_tsf_list_len = len(tsf.engineer_of_records)
    eor_data = {
        'party_name': 'LastName',
        'phone_no': '240-359-2232',
        'first_name': 'A first name',
        'email': 'test@email.com',
        'address_line_1': 'Addr1',
        'address_line_2': 'Addr2',
        'city': 'Victoria',
        'sub_division_code': 'BC',
        'post_code': 'V4D1B3',
    }

    post_resp = test_client.post(
        f'/mines/{tsf.mine.mine_guid}/tailings/{tsf.mine_tailings_storage_facility_guid}/party_appt', data=eor_data, headers=auth_headers['full_auth_header'])
    assert post_resp.status_code == 200

    new_eor_data = {
        'party_name': 'EOR2',
        'phone_no': '240-359-2232',
        'first_name': 'Another first name',
        'email': 'test2@email.com',
        'address_line_1': 'Addr3',
        'address_line_2': 'Addr4',
        'city': 'Vancouver',
        'sub_division_code': 'BC',
        'post_code': 'V4D1B3',
    }

    post_resp2 = test_client.post(
        f'/mines/{tsf.mine.mine_guid}/tailings/{tsf.mine_tailings_storage_facility_guid}/party_appt', data=new_eor_data, headers=auth_headers['full_auth_header'])

    assert post_resp2.status_code == 200

    assert len(tsf.engineer_of_records) == org_mine_tsf_list_len + 2



    assert tsf.engineer_of_record.party.party_name == 'EOR2'

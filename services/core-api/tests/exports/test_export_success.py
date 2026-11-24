import json, pytest, uuid
from datetime import date
from app.api.exports.mines.models.mine_summary_view import MineSummaryView
from app.api.exports.mines.resources.mine_summary_resource import PAGE_DEFAULT, PER_PAGE_DEFAULT
from tests.factories import MineFactory, MinePartyAppointmentFactory


def _view_permittee_guids(permit_id):
    return {str(r.permittee_party_guid) for r in MineSummaryView.query.filter_by(permit_id=permit_id).all()}


def test_mine_summary_export_success(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        '/exports/mine-summary-csv', headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 200

def test_mine_summary_export_paginated(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        '/exports/mine-summary', headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 200

    get_data = json.loads(get_resp.data.decode()).get('data')

    assert len(get_data['mines']) <= PER_PAGE_DEFAULT
    assert get_data['per_page'] == PER_PAGE_DEFAULT
    assert get_data['current_page'] == PAGE_DEFAULT
    assert get_data['total'] == MineSummaryView.query.count()

def test_mine_summary_view_permittee_ignores_deleted_appointment(db_session):
    # A deleted appointment must never be picked, even when it's the newest
    mine = MineFactory()
    permit = mine.mine_permit[0]
    current = MinePartyAppointmentFactory(
        permittee=True, mine=mine, permit_id=permit.permit_id, start_date=date(2024, 11, 1), end_date=None)
    MinePartyAppointmentFactory(
        permittee=True, mine=mine, permit_id=permit.permit_id, start_date=date(2025, 1, 1), end_date=None, deleted_ind=True)

    assert _view_permittee_guids(permit.permit_id) == {str(current.party.party_guid)}

def test_mine_summary_view_permittee_picks_newest_start_date(db_session):
    # Matches Core: newest start date wins, even over an older appointment with no end date
    mine = MineFactory()
    permit = mine.mine_permit[0]
    MinePartyAppointmentFactory(
        permittee=True, mine=mine, permit_id=permit.permit_id, start_date=date(2019, 8, 20), end_date=None)
    newest = MinePartyAppointmentFactory(
        permittee=True, mine=mine, permit_id=permit.permit_id, start_date=date(2023, 5, 1), end_date=date(2023, 5, 1))

    assert _view_permittee_guids(permit.permit_id) == {str(newest.party.party_guid)}

def test_core_static_content_success(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        '/exports/core-static-content', headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 200

def test_now_application_gis_export_success_no_filter(test_client, db_session, auth_headers):
    get_resp = test_client.get('/exports/now-application-gis-export', headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 200

def test_now_application_gis_export_success_ada_filter(test_client, db_session, auth_headers):
    get_resp = test_client.get('/exports/now-application-gis-export?application_type_code=ADA', headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 200

def test_now_application_gis_export_failure_bad_filter(test_client, db_session, auth_headers):
    get_resp = test_client.get('/exports/now-application-gis-export?application_type_code=ZZZ', headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 400
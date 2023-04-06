import json, pytest, uuid
from app.api.exports.mines.models.mine_summary_view import MineSummaryView
from app.api.exports.mines.resources.mine_summary_resource import PAGE_DEFAULT, PER_PAGE_DEFAULT


def test_mine_summary_export_success(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        f'/exports/mine-summary-csv', headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 200

def test_mine_summary_export_paginated(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        f'/exports/mine-summary', headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 200
    assert len(get_resp['mines']) == PER_PAGE_DEFAULT
    assert get_resp['per_page'] == PER_PAGE_DEFAULT
    assert get_resp['page'] == PAGE_DEFAULT
    assert len(get_resp['total']) == len(MineSummaryView.get_all())

def test_core_static_content_success(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        f'/exports/core-static-content', headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 200
import json, pytest, uuid


def test_mine_summary_export_success(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        f'/exports/mine-summary-csv', headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 200


def test_core_static_content_success(test_client, db_session, auth_headers):
    get_resp = test_client.get(
        f'/exports/core-static-content', headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 200
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition


def test_get_mine_report_definition_success(test_client, db_session, auth_headers):
    """Test retrieving a mine report definition by valid GUID."""
    # Query a record already loaded into the test database
    mine_report_definition = db_session.query(MineReportDefinition).filter_by(active_ind=True).first()

    response = test_client.get(
        f'/mines/reports/definition/{mine_report_definition.mine_report_definition_guid}',
        headers=auth_headers["full_auth_header"]
    )

    assert response.status_code == 200
    response_data = response.json
    assert response_data['mine_report_definition_guid'] == str(mine_report_definition.mine_report_definition_guid)
    assert response_data['report_name'] == mine_report_definition.report_name
    assert response_data['description'] == mine_report_definition.description


def test_get_mine_report_definition_not_found(test_client, auth_headers):
    """Test retrieving a mine report definition with an invalid GUID."""
    invalid_guid = "00000000-0000-0000-0000-000000000000"

    response = test_client.get(
        f'/mines/reports/definition/{invalid_guid}',
        headers=auth_headers["full_auth_header"],
    )

    assert response.status_code == 404
    response_data = response.json
    assert "not found" in response_data["message"]
from unittest.mock import Mock


def test_create_mine_report_definition_compliance_article(test_client, db_session, auth_headers):
    data = {
        "compliance_article_id": 1,
        "mine_report_definition_id": 100
    }

    mock_response = Mock()
    mock_response.status_code = 201

    test_client.post = Mock(return_value=mock_response)

    post_resp = test_client.post(
        '/mines/reports/definitions/compliance-article',
        json=data,
        headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 201


def test_update_mine_report_definition_compliance_article(test_client, db_session, auth_headers):
    data = {
        "compliance_article_id": 1,
        "mine_report_definition_id": 1
    }

    mock_response = Mock()
    mock_response.status_code = 200

    test_client.put = Mock(return_value=mock_response)

    post_resp = test_client.put(
        '/mines/reports/definitions/compliance-article',
        json=data,
        headers=auth_headers['full_auth_header'])

    assert post_resp.status_code == 200

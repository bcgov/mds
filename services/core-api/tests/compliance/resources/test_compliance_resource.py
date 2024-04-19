import json, pytest

from app.api.compliance.models.compliance_article import ComplianceArticle


def test_get_complaince_articles(test_client, auth_headers, db_session):

    get_resp = test_client.get(f'/compliance/codes', headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 200, get_resp.response
    get_data = json.loads(get_resp.data.decode())
    assert len(get_data['records']) == ComplianceArticle.query.count()


def test_get_compliance_articles_with_one_or_more_query_parameters(test_client, auth_headers, db_session):
    get_resp = test_client.get(f'/compliance/codes?article_act_code=HSRCM', headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 200, get_resp.response
    get_data = json.loads(get_resp.data.decode())
    assert len(get_data['records']) == ComplianceArticle.query.filter_by(article_act_code='HSRCM', expiry_date='9999-12-31').count()


def test_create_compliance_article(test_client, db_session, auth_headers):
    data = {
        "article_act_code": "HSRCM",
        "section": "10",
        "sub_section": "7",
        "paragraph": "18",
        "sub_paragraph": 19,
        "description": "Test Description",
        "effective_date": "2024-02-15",
        "expiry_date": "9999-12-31",
        "create_user": "system-mds",
        "create_timestamp": "2024-03-04T12:20:44.679Z",
        "update_user": "system-mds",
        "update_timestamp": "2024-03-04T12:20:44.679Z",
        "long_description": "Test Desc",
        "help_reference_link": "http://www.test.com",
        "cim_or_cpo": "CIM"
    }

    post_resp = test_client.post(
        '/compliance',
        json=data,
        headers=auth_headers['core_edit_code'])

    assert post_resp.status_code == 201


def test_update_compliance_article(test_client, db_session, auth_headers):
    data = {
        "article_act_code": "HSRCM",
        "section": "10",
        "sub_section": "7",
        "paragraph": "18",
        "sub_paragraph": 19,
        "description": "Test",
        "effective_date": "2024-02-15",
        "expiry_date": "9999-12-31",
        "create_user": "system-mds",
        "create_timestamp": "2024-03-04T12:20:44.679Z",
        "update_user": "system-mds",
        "update_timestamp": "2024-03-04T12:20:44.679Z",
        "long_description": "Test",
        "help_reference_link": "http://www.test.com",
        "cim_or_cpo": "CIM"
    }
    compliance_article_id = 1

    put_resp = test_client.put(
        f'/compliance/{compliance_article_id}',
        json=data,
        headers=auth_headers['core_edit_code'])

    assert put_resp.status_code == 200

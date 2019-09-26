import json, pytest

from app.api.compliance.models.compliance_article import ComplianceArticle


def test_get_complaince_articles(test_client, auth_headers, db_session):

    get_resp = test_client.get(f'/compliance/codes', headers=auth_headers['full_auth_header'])

    assert get_resp.status_code == 200, get_resp.response
    get_data = json.loads(get_resp.data.decode())
    assert len(get_data['records']) == ComplianceArticle.query.count()

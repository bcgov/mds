from app.api.mines.response_models import MINE_REPORT_DEFINITION_COMPLIANCE_ARTICLE_MODEL
from tests.factories import MineReportDefinitionComplianceArticleXrefFactory
from flask_restx import marshal


def test_create_mine_report_definition_compliance_article_xref(test_client, db_session, auth_headers):
    data = {
        "compliance_article_id": 1,
        "mine_report_definition_id": 100
    }

    post_resp = test_client.post(
        '/mines/reports/definitions/compliance-article',
        json=data,
        headers=auth_headers['core_edit_code'])

    assert post_resp.status_code == 201


def test_update_existing_mine_report_definition_compliance_article_xref(test_client, db_session, auth_headers):
    mine_report_definition_compliance_article_xref = MineReportDefinitionComplianceArticleXrefFactory()
    data = marshal(mine_report_definition_compliance_article_xref, MINE_REPORT_DEFINITION_COMPLIANCE_ARTICLE_MODEL)
    data['compliance_article_id'] = 1
    data['mine_report_definition_id'] = 100

    post_resp = test_client.put(
        f'/mines/reports/definitions/compliance-article/{mine_report_definition_compliance_article_xref.mine_report_definition_compliance_article_xref_guid}',
        json=data,
        headers=auth_headers['core_edit_code'])

    assert post_resp.status_code == 200

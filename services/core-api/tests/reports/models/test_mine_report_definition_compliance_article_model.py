from unittest.mock import MagicMock

from app.api.mines.reports.models.mine_report_definition_compliance_article_xref import \
    MineReportDefinitionComplianceArticleXref


def test_find_by_mine_report_definition_compliance_article_xref_guid():
    MineReportDefinitionComplianceArticleXref.query = MagicMock()

    result = MineReportDefinitionComplianceArticleXref.find_by_mine_report_definition_compliance_article_xref_guid(
        'fake_guid'
    )

    MineReportDefinitionComplianceArticleXref.query.filter_by.assert_called_once_with(
        mine_report_definition_compliance_article_xref_guid='fake_guid'
    )

    assert result == MineReportDefinitionComplianceArticleXref.query.filter_by().first.return_value


def test_create_mine_report_definition_compliance_article_xref():
    MineReportDefinitionComplianceArticleXref.save = MagicMock()
    result = MineReportDefinitionComplianceArticleXref.create(
        1,
        2,
        add_to_session=True
    )
    MineReportDefinitionComplianceArticleXref.save.assert_called_once()
    assert isinstance(result, MineReportDefinitionComplianceArticleXref)


def test_update_mine_report_definition_compliance_article_xref():
    instance = MineReportDefinitionComplianceArticleXref()
    instance.save = MagicMock()
    result = instance.update(
        1,
        2,
        add_to_session=True
    )
    assert instance.mine_report_definition_id == 1
    assert instance.compliance_article_id == 2
    instance.save.assert_called_once()
    assert isinstance(result, MineReportDefinitionComplianceArticleXref)

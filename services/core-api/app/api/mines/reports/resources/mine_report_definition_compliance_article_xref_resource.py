from flask_restx import Resource
from werkzeug.exceptions import NotFound

from app.api.mines.reports.models.mine_report_definition_compliance_article_xref import \
    MineReportDefinitionComplianceArticleXref
from app.api.mines.response_models import MINE_REPORT_DEFINITION_COMPLIANCE_ARTICLE_MODEL
from app.api.utils.access_decorators import EDIT_CODE, requires_any_of
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api


class MineReportDefinitionComplianceArticleCreateResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'mine_report_definition_id',
        type=int,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'compliance_article_id',
        type=int,
        store_missing=False,
        required=True,
    )

    @api.doc(description='Create link Mine Definition Report and corresponding Compliance Article.')
    @api.expect(parser)
    @api.marshal_with(MINE_REPORT_DEFINITION_COMPLIANCE_ARTICLE_MODEL, code=201)
    @requires_any_of([EDIT_CODE])
    def post(self):
        data = self.parser.parse_args()

        mine_report_definition_id = data.get('mine_report_definition_id')
        compliance_article_id = data.get('compliance_article_id')

        mine_report_definition_compliance_article = MineReportDefinitionComplianceArticleXref.create(
            mine_report_definition_id,
            compliance_article_id)
        mine_report_definition_compliance_article.save()
        return mine_report_definition_compliance_article, 201


class MineReportDefinitionComplianceArticleUpdateResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'mine_report_definition_id',
        type=int,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'compliance_article_id',
        type=int,
        store_missing=False,
        required=True,
    )

    @api.doc(description='Update Link between a Definition Report corresponding Compliance Article.')
    @api.expect(parser)
    @api.marshal_with(MINE_REPORT_DEFINITION_COMPLIANCE_ARTICLE_MODEL, code=201)
    @requires_any_of([EDIT_CODE])
    def put(self, mine_report_definition_compliance_article_xref_guid):
        data = self.parser.parse_args()

        mine_report_definition_id = data.get('mine_report_definition_id')
        compliance_article_id = data.get('compliance_article_id')

        update_mine_report_definition_compliance = MineReportDefinitionComplianceArticleXref \
            .find_by_mine_report_definition_compliance_article_xref_guid(
            mine_report_definition_compliance_article_xref_guid)

        if update_mine_report_definition_compliance is None:
            raise NotFound('Mine Report Definition Compliance Article Reference found')

        update_mine_report_definition_compliance.update(
            mine_report_definition_id,
            compliance_article_id)
        update_mine_report_definition_compliance.save()
        return update_mine_report_definition_compliance
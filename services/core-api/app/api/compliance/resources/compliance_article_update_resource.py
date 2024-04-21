from flask_restx import Resource, inputs, reqparse, fields

from app.api.compliance.models.compliance_article import ComplianceArticle
from app.api.compliance.response_models import COMPLIANCE_ARTICLE_MODEL, COMPLIANCE_ARTICLE_UPDATE_MODEL
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from app.api.utils.access_decorators import EDIT_CODE, requires_any_of


class ComplianceArticleUpdateResource(Resource, UserMixin):
    parser = reqparse.RequestParser()

    parser.add_argument(
        'compliance_article_codes',
        type=list,
        location='json',
        store_missing=False,
        required=True
    )

    @api.doc(description='Update an existing Compliance Article.', body=COMPLIANCE_ARTICLE_UPDATE_MODEL)
    @api.expect(parser)
    @api.marshal_with(COMPLIANCE_ARTICLE_MODEL, code=200, as_list=True)
    @requires_any_of([EDIT_CODE])
    def put(self):
        data = self.parser.parse_args()
        compliance_article_codes = data.get('compliance_article_codes')
        compliance_article = ComplianceArticle()
        update_compliance_article_codes = compliance_article.update_all(compliance_article_codes)

        if len(update_compliance_article_codes) == len(compliance_article_codes):
            compliance_article.save_all(update_compliance_article_codes)

        return update_compliance_article_codes

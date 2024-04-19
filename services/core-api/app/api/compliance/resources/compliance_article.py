from flask_restx import Resource, fields
from app.extensions import api
from app.api.utils.access_decorators import (requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, EDIT_CODE)
from app.api.utils.resources_mixins import UserMixin
from app.api.compliance.models.compliance_article import ComplianceArticle
from app.api.compliance.response_models import COMPLIANCE_ARTICLE_MODEL
from app.api.utils.custom_reqparser import CustomReqparser


class ComplianceArticleResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('article_act_code', type=str, store_missing=False,
                        required=False, )
    parser.add_argument('section', type=str, store_missing=False,
                        required=False, )
    parser.add_argument('description', type=str, store_missing=False,
                        required=False, )
    parser.add_argument('long_description', type=str, store_missing=False,
                        required=False, )
    parser.add_argument('sub_section', type=str, store_missing=False,
                        required=False, )
    parser.add_argument('paragraph', type=str, store_missing=False,
                        required=False, )
    parser.add_argument('sub_paragraph', type=str, store_missing=False,
                        required=False, )
    parser.add_argument('effective_date', type=str, store_missing=False,
                        required=False, )
    parser.add_argument('expiry_date', type=str, store_missing=False,
                        required=False, )

    @api.doc(description=
             'This endpoint returns a list of all possible compliance codes and their descriptions.',
             params={
                 'article_act_code': 'Filter by article code.',
                 'section': 'Filter by section.',
                 'description': 'Filter by description.',
                 'long_description': 'Filter by long description.',
                 'sub_section': 'Filter by sub section',
                 'paragraph': 'Filter by paragraph',
                 'sub_paragraph': 'Filter by a sub paragraph',
                 'effective_date': 'Filter by a given effective date',
                 'expiry_date': 'Filter by expiry date. Default: 9999-12-31',
                }
             )
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT, EDIT_CODE])
    @api.marshal_with(COMPLIANCE_ARTICLE_MODEL, code=200, envelope='records')
    def get(self):
        args = self.parser.parse_args()
        records = ComplianceArticle.filter_or_get_all(**args)
        return records

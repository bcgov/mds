from flask_restx import Resource, inputs

from app.api.compliance.models.compliance_article import ComplianceArticle
from app.api.compliance.response_models import COMPLIANCE_ARTICLE_MODEL
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.extensions import api
from app.api.utils.access_decorators import EDIT_CODE, requires_any_of
from werkzeug.exceptions import NotFound


class ComplianceArticleUpdateResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'article_act_code',
        type=str,
        store_missing=False,
        required=True
    )
    parser.add_argument(
        'section',
        type=str,
        store_missing=False,
        required=True
    )
    parser.add_argument(
        'description',
        type=str,
        store_missing=False,
        required=True
    )
    parser.add_argument(
        'long_description',
        type=str,
        store_missing=False,
        required=True
    )
    parser.add_argument(
        'sub_section',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'paragraph',
        type=str,
        store_missing=False,
        required=False
    )
    parser.add_argument(
        'sub_paragraph',
        type=str,
        store_missing=False,
        required=False
    )
    parser.add_argument(
        'help_reference_link',
        type=str,
        store_missing=False,
        required=False
    )
    parser.add_argument(
        'cim_or_cpo',
        type=str,
        store_missing=False,
        required=False
    )
    parser.add_argument(
        'effective_date',
        type=lambda x: inputs.datetime_from_iso8601(x),
        store_missing=False,
        required=True
    )
    parser.add_argument(
        'expiry_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else '9999-12-31',
        store_missing=False,
        required=False
    )

    @api.doc(description='Update an existing Compliance Article.')
    @api.expect(parser)
    @api.marshal_with(COMPLIANCE_ARTICLE_MODEL, code=201)
    @requires_any_of([EDIT_CODE])
    def put(self, compliance_article_id):
        data = self.parser.parse_args()

        article_act_code = data.get('article_act_code')
        section = data.get('section')
        description = data.get('description')
        long_description = data.get('long_description')
        sub_section = data.get('sub_section')
        paragraph = data.get('paragraph')
        sub_paragraph = data.get('sub_paragraph')
        help_reference_link = data.get('help_reference_link')
        cim_or_cpo = data.get('cim_or_cpo')
        effective_date = data.get('effective_date')
        expiry_date = data.get('expiry_date')

        update_compliance_article = ComplianceArticle.find_by_compliance_article_id(compliance_article_id)

        if update_compliance_article is None:
            raise NotFound('Compliance Article not found')

        update_compliance_article.update(article_act_code,
                                         description,
                                         long_description,
                                         effective_date,
                                         expiry_date,
                                         section,
                                         sub_section,
                                         paragraph,
                                         sub_paragraph,
                                         help_reference_link,
                                         cim_or_cpo)
        update_compliance_article.save()
        return update_compliance_article

from flask_restx import Resource, inputs, reqparse
from datetime import datetime
from app.api.compliance.models.compliance_article import ComplianceArticle
from app.api.compliance.response_models import COMPLIANCE_ARTICLE_MODEL
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from app.api.utils.access_decorators import EDIT_CODE, requires_any_of
from werkzeug.exceptions import BadRequest


class ComplianceArticleCreateResource(Resource, UserMixin):
    parser = reqparse.RequestParser()

    parser.add_argument(
        'article_act_code',
        type=str,
        store_missing=False,
        required=True,
        location='json',
    )
    parser.add_argument(
        'section',
        type=str,
        store_missing=False,
        required=True,
        location='json',
    )
    parser.add_argument(
        'description',
        type=str,
        store_missing=False,
        required=True,
        location='json',
    )
    parser.add_argument(
        'long_description',
        type=str,
        store_missing=False,
        required=True,
        location='json',
    )
    parser.add_argument(
        'sub_section',
        type=str,
        store_missing=False,
        required=False,
        location='json',
    )
    parser.add_argument(
        'paragraph',
        type=str,
        store_missing=False,
        required=False,
        location='json',
    )
    parser.add_argument(
        'sub_paragraph',
        type=str,
        store_missing=False,
        required=False,
        location='json',
    )
    parser.add_argument(
        'help_reference_link',
        type=str,
        store_missing=False,
        required=False,
        location='json',
    )
    parser.add_argument(
        'cim_or_cpo',
        type=str,
        store_missing=False,
        required=False,
        location='json',
    )
    parser.add_argument(
        'effective_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        store_missing=False,
        required=True,
        location='json',
    )
    parser.add_argument(
        'expiry_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        store_missing=False,
        required=False,
        location='json',
    )

    @api.doc(description='Create a new Compliance Article.')
    @api.expect(parser)
    @api.marshal_with(COMPLIANCE_ARTICLE_MODEL, code=201)
    @requires_any_of([EDIT_CODE])
    def post(self):
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

        compliance_article = ComplianceArticle.find_existing_compliance_article(article_act_code, section, sub_section,
                                                                                paragraph,
                                                                                sub_paragraph,
                                                                                expiry_date)
        if compliance_article is not None:
            raise BadRequest('Another compliance article with the same properties already exists.')

        new_compliance_article = ComplianceArticle.create(article_act_code,
                                                          section,
                                                          sub_section,
                                                          paragraph,
                                                          sub_paragraph,
                                                          description,
                                                          long_description,
                                                          effective_date,
                                                          expiry_date,
                                                          help_reference_link,
                                                          cim_or_cpo)
        new_compliance_article.save()
        return new_compliance_article, 201

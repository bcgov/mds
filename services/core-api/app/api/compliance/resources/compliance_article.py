from flask_restx import Resource, fields
from app.extensions import api
from app.api.utils.access_decorators import (requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, EDIT_CODE)
from app.api.utils.resources_mixins import UserMixin
from app.api.compliance.models.compliance_article import ComplianceArticle
from app.api.compliance.response_models import COMPLIANCE_ARTICLE_MODEL


class ComplianceArticleResource(Resource, UserMixin):
    @api.doc(description=
             'This endpoint returns a list of all possible compliance codes and their descriptions.'
             )
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT, EDIT_CODE])
    @api.marshal_with(COMPLIANCE_ARTICLE_MODEL, code=200, envelope='records')
    def get(self):
        records = ComplianceArticle.get_all()
        return records

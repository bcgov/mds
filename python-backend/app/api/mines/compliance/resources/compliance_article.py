from flask_restplus import Resource, fields
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ..models.compliance_article import ComplianceArticle

class ComplianceArticleResource(Resource, UserMixin, ErrorMixin):
    compliance_article_model = api.model('ComplianceArticle', {
        'compliance_article_id': fields.Integer,
        'article_act_code': fields.String,
        'section': fields.String,
        'sub_section': fields.String,
        'paragraph': fields.String,
        'sub_paragraph': fields.String,
        'description': fields.String,
        'effective_date': fields.Date,
        'expiry_date': fields.Date
    })

    @api.doc(
        description=
        'This endpoint returns a list of all possible compliance codes and thier descriptions.'
    )
    @requires_role_mine_view
    @api.marshal_with(compliance_article_model, code=200, envelope='records')
    def get(self):
        records = ComplianceArticle.query.all()
        if records is None:
            records = []
        return records

from app.extensions import api
from flask_restx import fields

COMPLIANCE_ARTICLE_MODEL = api.model(
    'ComplianceArticle', {
        'compliance_article_id': fields.Integer,
        'article_act_code': fields.String,
        'section': fields.String,
        'sub_section': fields.String,
        'paragraph': fields.String,
        'sub_paragraph': fields.String,
        'description': fields.String,
        'long_description': fields.String,
        'effective_date': fields.Date,
        'expiry_date': fields.Date,
        'help_reference_link': fields.String,
        'cim_or_cpo': fields.String
    })

COMPLIANCE_ARTICLE_UPDATE_MODEL = api.model(
    'ComplianceArticleUpdate', {
        'compliance_article_codes': fields.List(fields.Nested(COMPLIANCE_ARTICLE_MODEL))
    })

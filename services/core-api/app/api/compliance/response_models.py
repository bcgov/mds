from app.extensions import api
from flask_restx import fields

MINE_REPORT_DEFINITION_BASE_MODEL = api.model(
    'MineReportDefinitionBase', {
        'mine_report_definition_guid': fields.String,
        'report_name': fields.String,
        'description': fields.String,
        'due_date_period_months': fields.Integer,
        'mine_report_due_date_type': fields.String,
        'default_due_date': fields.Date,
        'active_ind': fields.Boolean,
        'is_common': fields.Boolean,
        'is_prr_only': fields.Boolean,
    })


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
        'cim_or_cpo': fields.String,
        'reports': fields.List(fields.Nested(MINE_REPORT_DEFINITION_BASE_MODEL))
    })

COMPLIANCE_ARTICLE_UPDATE_MODEL = api.model(
    'ComplianceArticleUpdate', {
        'compliance_article_codes': fields.List(fields.Nested(COMPLIANCE_ARTICLE_MODEL))
    })

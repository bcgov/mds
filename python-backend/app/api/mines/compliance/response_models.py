from app.extensions import api
from flask_restplus import fields

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
        'expiry_date': fields.Date
    })

ORDER_MODEL = api.model(
    'MineComplianceOrder', {
        "order_no": fields.String,
        "violation": fields.String,
        "report_no": fields.Integer,
        "inspector": fields.String,
        "due_date": fields.Date,
        "order_status": fields.String,
        "overdue": fields.Boolean,
    })

COMPLAINCE_AGGREGATION_MODEL = api.model(
    'MineComplianceStats', {
        'num_inspections': fields.Integer,
        'num_advisories': fields.Integer,
        'num_warnings': fields.Integer,
        'num_requests': fields.Integer,
    })

MINE_COMPLIANCE_RESPONSE_MODEL = api.model(
    'MineComplianceData', {
        'last_inspection': fields.DateTime,
        'last_inspector': fields.String,
        'num_open_orders': fields.Integer,
        'num_overdue_orders': fields.Integer,
        'all_time': fields.Nested(COMPLAINCE_AGGREGATION_MODEL),
        'last_12_months': fields.Nested(COMPLAINCE_AGGREGATION_MODEL),
        'current_fiscal': fields.Nested(COMPLAINCE_AGGREGATION_MODEL),
        'orders': fields.List(fields.Nested(ORDER_MODEL)),
    })
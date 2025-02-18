from app.api.compliance.response_models import COMPLIANCE_ARTICLE_MODEL
from app.api.dams.dto import DAM_MODEL
from app.api.parties.party_appt.models.mine_party_appt import (
    MinePartyAcknowledgedStatus,
    MinePartyAppointmentStatus,
)
from app.api.parties.response_models import PARTY
from app.api.utils.feature_flag import Feature, is_feature_enabled
from app.extensions import api
from flask_restx import fields, marshal

PERMIT_CONDITION_EXTRACTION_TASK = api.model(
    'PermitExtractionTask', {
        'create_timestamp': fields.DateTime,
        'permit_extraction_task_id': fields.String,
        'task_id': fields.String,
        'task_status': fields.String,
        'permit_amendment_guid': fields.String,
        'permit_amendment_document_guid': fields.String,
        'core_status_task_id': fields.String
    })

RECENT_TASK = api.model(
    'RecentTask', {
        'task_id': fields.String,
        'status': fields.String,
        'created': fields.String,
        'updated': fields.String,
        'mine_name': fields.String,
        'mine_no': fields.String,
        'permit_no': fields.String,
        'amendment_issue_date': fields.String,
        'document_name': fields.String,
        'document_guid': fields.String
    })

EXTRACTION_DASHBOARD = api.model(
    'ExtractionDashboard', {
        'total_counts': fields.Raw(description='Total count of tasks by status'),
        'last_24h': fields.Raw(description='Count of tasks from last 24 hours by status'),
        'recent_tasks': fields.List(fields.Nested(RECENT_TASK)),
        'mines': fields.List(fields.Raw(description='Hierarchical mine data'))
    })

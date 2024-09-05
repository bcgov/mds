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
        'permit_extraction_task_id': fields.String,
        'task_id': fields.String,
        'task_status': fields.String,
        'permit_amendment_guid': fields.String,
        'permit_amendment_document_guid': fields.String,
        'core_status_task_id': fields.String
    })

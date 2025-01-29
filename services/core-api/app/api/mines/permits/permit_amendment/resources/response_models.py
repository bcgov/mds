from app.api.dams.models.dam import ConsequenceClassification, DamType, OperatingStatus
from app.api.mines.permits.permit_conditions.services.permit_condition_comparer import (
    ConditionChangeType,
)
from app.extensions import api
from flask_restx import fields

PERMIT_CONDITION_DIFF_MODEL = api.model('PermitConditionDiff', {
    'condition_guid': fields.String(required=True, description='The unique identifier of the current condition'),
    'previous_condition_guid': fields.String(description='The unique identifier of the matched previous condition'),
    'text_similarity': fields.Float(min=0, max=1, description='Text similarity score between conditions'),
    'structure_similarity': fields.Float(min=0, max=1, description='Structure similarity score between conditions'),
    'combined_score': fields.Float(min=0, max=1, description='Combined similarity score'),
    'change_type': fields.String(enum=ConditionChangeType, attribute='change_type.name', 
                                description='Type of change detected (added/modified/unchanged/moved)')
})

PERMIT_CONDITION_DIFF_LIST_MODEL = api.model('PermitConditionDiffList', {
    'comparison': fields.List(fields.Nested(PERMIT_CONDITION_DIFF_MODEL), 
                            description='List of condition comparisons')
})

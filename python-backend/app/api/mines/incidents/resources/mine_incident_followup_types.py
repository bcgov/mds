from flask_restplus import Resource, reqparse, fields, inputs
from flask import request
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create

from ..models.mine_incident_followup_investigation_type import MineIncidentFollowupInvestigationType
from ...mine_api_models import MINE_INCIDENT_FOLLOWUP_INVESTIGATION_TYPE_MODEL


class MineIncidentFollowupTypeResource(Resource, UserMixin):
    @api.marshal_with(MINE_INCIDENT_FOLLOWUP_INVESTIGATION_TYPE_MODEL,
                      envelope='options',
                      code=200,
                      as_list=True)
    @api.doc(description='returns the possible EMPR followup action for mine incidents')
    @requires_role_mine_view
    def get(self):
        return MineIncidentFollowupInvestigationType.query.all()

from flask_restplus import Resource, reqparse, fields, inputs
from flask import request
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_edit

from app.api.incidents.response_models import MINE_INCIDENT_FOLLOWUP_INVESTIGATION_TYPE_MODEL
from app.api.incidents.models.mine_incident_followup_investigation_type import MineIncidentFollowupInvestigationType


class MineIncidentFollowupTypeResource(Resource, UserMixin):
    @api.marshal_with(MINE_INCIDENT_FOLLOWUP_INVESTIGATION_TYPE_MODEL,
                      envelope='records',
                      code=200,
                      as_list=True)
    @api.doc(description='Returns the possible EMPR followup action for mine incidents')
    @requires_role_view_all
    def get(self):
        return MineIncidentFollowupInvestigationType.query.all()

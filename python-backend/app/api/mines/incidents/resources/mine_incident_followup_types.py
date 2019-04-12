from flask_restplus import Resource, reqparse, fields, inputs
from flask import request
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create

from ..models.mine_incident_followup_type import MineIncidentFollowupType

mine_incident_followup_type_model = api.model(
    'Mine Incident Followup Type', {
        'mine_incident_followup_type_code': fields.String,
        'description': fields.String,
        'display_order': fields.Integer,
        'active_ind': fields.Boolean
    })


class MineIncidentFollowupTypeResource(Resource, UserMixin):
    @api.marshal_with(mine_incident_followup_type_model, envelope='options', code=200, as_list=True)
    @api.doc(description='returns the possible EMPR followup action for mine incidents')
    @requires_role_mine_view
    def get(self):
        return MineIncidentFollowupType.get_active()

from datetime import datetime, timedelta
import uuid

from flask import request
from flask_restplus import Resource, reqparse
from sqlalchemy import or_

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin

from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.api.parties.party_appt.models.mine_party_appt_type import MinePartyAppointmentType
from app.api.parties.response_models import MINE_PARTY_APPT_TYPE_MODEL


class MinePartyApptTypeResource(Resource, UserMixin):
    @api.doc(
        params={
            'mine_party_appt_type_code':
            'Mine party appointment type code to be retrieved (return all if not provided)'
        })
    @api.marshal_with(MINE_PARTY_APPT_TYPE_MODEL, code=201)
    @requires_role_view_all
    def get(self):
        return MinePartyAppointmentType.get_active()

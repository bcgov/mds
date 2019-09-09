from datetime import datetime, timedelta
import uuid

from flask import request
from flask_restplus import Resource, reqparse
from sqlalchemy import or_

from ..models.mine_party_appt import MinePartyAppointment
from ..models.mine_party_appt_type import MinePartyAppointmentType
from app.extensions import api
from ....utils.access_decorators import requires_role_view_all
from ....utils.resources_mixins import UserMixin, ErrorMixin


class MinePartyApptTypeResource(Resource, UserMixin, ErrorMixin):

    @api.doc(params={'mine_party_appt_type_code': 'Mine party appointment type code to be retrieved (return all if not provided)'})
    @requires_role_view_all
    def get(self, mine_party_appt_type_code=None):
        if mine_party_appt_type_code is None:
            mine_party_appt_types = MinePartyAppointmentType.find_all_active()
            return list(map(lambda x: x.json(), mine_party_appt_types))
        else:
            mine_party_appt_type = MinePartyAppointmentType.find_by_mine_party_appt_type_code(
                mine_party_appt_type_code)
            return mine_party_appt_type.json()

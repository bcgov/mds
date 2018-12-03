from datetime import datetime, timedelta
import uuid

from flask import request
from flask_restplus import Resource, reqparse
from sqlalchemy import or_

from ..models.mine_party_appt import MinePartyAppointment
from ..models.mine_party_appt_type import MinePartyAppointmentType
from ....constants import PARTY_STATUS_CODE
from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin

class MinePartyApptResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()

    @api.doc(params={'mine_party_appt_guid': 'mine party appointment serial id'})
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, mine_party_appt_guid=None):
        if mine_party_appt_guid:
            return MinePartyAppointment.find_by_guid(mine_party_appt_guid)
        else: 
            return self.create_error_payload(400, 'NOT IMPLEMENTED YET'), 400
            # return MinePartyAppointment.find_by_mine_guid()
            #search by query string?? 
            #
            #
            #
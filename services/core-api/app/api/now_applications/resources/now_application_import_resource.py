import uuid
from datetime import datetime
from decimal import Decimal

from flask import request, current_app
from flask_restx import Resource
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit, requires_any_of, VIEW_ALL
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.mine.models.mine import Mine
from app.api.parties.party.models.party import Party
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.now_party_appointment import NOWPartyAppointment
from app.api.parties.party_appt.models.mine_party_appt_type import MinePartyAppointmentType

from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.activity_summary.exploration_access import ExplorationAccess
from app.api.now_applications.models.activity_summary.exploration_surface_drilling import ExplorationSurfaceDrilling
from app.api.now_applications.models.unit_type import UnitType
from app.api.now_applications.models.activity_detail.exploration_surface_drilling_detail import ExplorationSurfaceDrillingDetail

from app.api.now_applications.transmogrify_now import transmogrify_now
from app.api.services.nros_now_status_service import NROSNOWStatusService
from app.api.now_applications.models.now_application_status import NOWApplicationStatus


class NOWApplicationImportResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('mine_guid', type=str, help='guid of the mine.', required=True)
    parser.add_argument(
        'longitude',
        type=lambda x: Decimal(x) if x else None,
        help='Longitude point for the Notice of Work.',
        location='json')
    parser.add_argument(
        'latitude',
        type=lambda x: Decimal(x) if x else None,
        help='Latitude point for the Notice of Work.',
        location='json')
    parser.add_argument('contacts', type=list, location='json', store_missing=False)

    @requires_role_edit_permit
    @api.expect(parser)
    def post(self, application_guid):
        data = self.parser.parse_args()
        mine_guid = data.get('mine_guid')
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        contacts = data.get('contacts', [])

        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found')

        now_application_identity = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application_identity:
            raise NotFound('No identity record for this application guid.')

        application = transmogrify_now(now_application_identity)
        application.latitude = latitude
        application.longitude = longitude
        application.now_application_guid = application_guid

        for contact in contacts:
            party_guid = contact['party_guid']
            now_party = Party.find_by_party_guid(party_guid)

            if not now_party:
                raise NotFound(f'No party found for party with guid {party_guid}')

            Party.validate_phone_no(now_party.phone_no)

            mine_party_appt_type_code = contact['mine_party_appt_type_code']
            mine_party_appt_type = MinePartyAppointmentType.find_by_mine_party_appt_type_code(
                mine_party_appt_type_code)
            if not mine_party_appt_type:
                raise NotFound(
                    f'No mine party appointment type found for type with code {mine_party_appt_type_code}'
                )

            now_party_appt = NOWPartyAppointment(
                mine_party_appt_type_code=mine_party_appt_type_code,
                mine_party_appt_type=mine_party_appt_type,
                party=now_party)
            application.contacts.append(now_party_appt)

        # This is a first pass but by no means exhaustive solution to preventing the now application from being saved more than once.
        # In the event of multiple requests being fired simultaneously this can still sometimes fail.
        db.session.refresh(now_application_identity)
        if now_application_identity.now_application_id is not None:
            raise BadRequest('This record has already been imported.')

        application.save_import_meta()
        application.save()
        db.session.refresh(now_application_identity)
        now_application_identity.mine_guid = mine_guid
        now_application_identity.now_application.add_now_form_to_fap(
            "This document was automatically created when Verification was completed.")

        # update application status to received once imported
        now_application_identity.now_application.previous_application_status_code = now_application_identity.now_application.now_application_status_code
        now_application_identity.now_application.now_application_status_code = "REC"
        now_application_identity.save()

        NROSNOWStatusService.nros_now_status_update(
            now_application_identity.now_number,
            now_application_identity.now_application.status.description,
            now_application_identity.now_application.status_updated_date.strftime(
                "%Y-%m-%dT%H:%M:%S"))

        return {'now_application_guid': str(application.now_application_guid)}

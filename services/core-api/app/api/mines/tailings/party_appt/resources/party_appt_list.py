import uuid

from datetime import datetime, timezone
from dateutil.tz import UTC

import dateutil.parser

from flask import request, current_app
from flask_restplus import Resource
from sqlalchemy import or_, exc as alch_exceptions
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound, Forbidden

from app.api.parties.party.models.address import Address
from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_edit
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.parties.party.models.party import Party
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.api.parties.party_appt.models.mine_party_appt_type import MinePartyAppointmentType
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility
from app.api.constants import PERMIT_LINKED_CONTACT_TYPES


class MineTailingsStorageFacilityPartyAppointmentResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('mine_guid', type=str, help='guid of the mine.')
    parser.add_argument('mine_tailings_storage_facility_guid', type=str, help='guid of the tailings storage facility.')
    parser.add_argument(
        'party_name',
        type=str,
        help='Last name of the party (Person), or the Organization name (Organization).',
        required=True)
    parser.add_argument(
        'phone_no', type=str, help='The primary phone number of the party. Ex: 123-123-1234', required=True)
    parser.add_argument(
        'last_name', type=str, help='Last name of the party, if the party is a person.')
    parser.add_argument(
        'first_name', type=str, help='First name of the party, if the party is a person.')
    parser.add_argument('email', type=str, help='The primary email of the party.')
    parser.add_argument(
        'suite_no',
        type=str,
        store_missing=False,
        help='The suite number of the party address. Ex: 123')
    parser.add_argument(
        'address_line_1',
        type=str,
        store_missing=False,
        help='The first address line of the party address. Ex: 1234 Foo Road')
    parser.add_argument(
        'address_line_2',
        type=str,
        store_missing=False,
        help='The second address line of the party address. Ex: 1234 Foo Road')
    parser.add_argument(
        'city',
        type=str,
        store_missing=False,
        help='The city where the party is located. Ex: FooTown')
    parser.add_argument(
        'sub_division_code',
        type=str,
        store_missing=False,
        help='The region code where the party is located. Ex: BC')
    parser.add_argument(
        'post_code',
        type=str,
        store_missing=False,
        help='The postal code of the party address. Ex: A0B1C2')

    @api.doc(params={
        'mine_guid': 'GUID of the mine to which the tailings is associated',
        'mine_tailings_storage_facility_guid': 'GUID of the tailings sotrage facility to create a party appointment for'
    }, body=parser.parser)
    @requires_role_mine_edit
    def post(self, mine_guid, mine_tailings_storage_facility_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        data = self.parser.parse_args()
        if not mine:
            raise NotFound('Mine not found.')

        mine_tsf = MineTailingsStorageFacility.find_by_tsf_guid(mine_tailings_storage_facility_guid)

        if not mine_tsf:
            raise NotFound("Tailing Storage Facility not found")

        if mine.mine_guid != mine_tsf.mine_guid:
            raise Forbidden("TSF is not associated with the given mine")

        party = Party.create(
            data.get('party_name'),
            data.get('phone_no'),
            'PER',
            email=data.get('email'),
            first_name=data.get('first_name'),
            add_to_session=True)

        if not party:
            raise InternalServerError('Error: Failed to create party')

        address = Address.create(
            suite_no=data.get('suite_no'),
            address_line_1=data.get('address_line_1'),
            address_line_2=data.get('address_line_2'),
            city=data.get('city'),
            sub_division_code=data.get('sub_division_code'),
            post_code=data.get('post_code'))
        party.address.append(address)

        party.save()

        related_guid = mine_tsf.mine_tailings_storage_facility_guid
        start_date = datetime.now(tz=timezone.utc)

        MinePartyAppointment.end_current_appointment(
            mine_guid=mine_guid,
            mine_party_appt_type_code='EOR',
            related_guid=related_guid,
            new_appointment_start_date=start_date
        )

        new_eor = MinePartyAppointment.create(
            mine=mine,
            tsf=mine_tsf,
            party_guid=party.party_guid,
            mine_party_appt_type_code='EOR',
            processed_by=self.get_user_info(),
            start_date=start_date)
        new_eor.assign_related_guid('EOR', related_guid)
        new_eor.save()

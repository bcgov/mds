from datetime import datetime, timezone

from flask import current_app
from flask_restx import Resource
from sqlalchemy import exc as alch_exceptions
from werkzeug.exceptions import NotFound, BadRequest

from app.api.constants import GET_ALL_INSPECTORS_KEY, GET_ALL_PROJECT_LEADS_KEY
from app.api.parties.party.models.address import Address
from app.api.parties.party.models.party import Party
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.api.parties.party_appt.models.party_business_role_appt import PartyBusinessRoleAppointment
from app.api.parties.response_models import PARTY
from app.api.users.minespace.models.minespace_user import MinespaceUser
from app.api.utils.access_decorators import MINE_ADMIN
from app.api.utils.access_decorators import requires_role_view_all, requires_role_mine_admin, \
    requires_any_of, EDIT_PARTY, MINESPACE_PROPONENT, is_minespace_user, bceid_username
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api, jwt, cache

from app.api.utils.helpers import validate_phone_no


class PartyResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'first_name',
        type=str,
        help='First name of the party, if the party is a person.',
        store_missing=False)
    parser.add_argument(
        'party_name',
        type=str,
        help='Last name of the party (Person), or the Organization name (Organization).',
        store_missing=False)
    parser.add_argument(
        'phone_no',
        type=str,
        help='The primary phone number of the party. Ex: 123-123-1234',
        store_missing=False)
    parser.add_argument(
        'phone_ext',
        type=str,
        help='The extension of the primary phone number. Ex: 1234',
        store_missing=False)
    parser.add_argument(
        'phone_no_sec',
        type=str,
        help='The second phone number of the party. Ex: 123-123-1234',
        store_missing=False)
    parser.add_argument(
        'phone_sec_ext',
        type=str,
        help='The extension of the second phone number. Ex: 1234',
        store_missing=False)
    parser.add_argument(
        'phone_no_ter',
        type=str,
        help='The tertiary phone number of the party. Ex: 123-123-1234',
        store_missing=False)
    parser.add_argument(
        'phone_ter_ext',
        type=str,
        help='The extension of the tertiary phone number. Ex: 1234',
        store_missing=False)
    parser.add_argument(
        'email', type=str, help='The primary email of the party.', store_missing=False)
    parser.add_argument(
        'email_sec', type=str, help='The secondary email of the party.', store_missing=False)
    parser.add_argument(
        'party_type_code', type=str, help='The type of the party. Ex: PER', store_missing=False)
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
    parser.add_argument(
        'job_title',
        type=str,
        store_missing=False,
        help='The job title of the party. Ex "Chief of Inspections"')
    parser.add_argument(
        'job_title_code',
        type=str,
        store_missing=False,
        help='The "job title role" of the party. Eg. EOR')
    parser.add_argument(
        'postnominal_letters',
        type=str,
        store_missing=False,
        help='Suffixes for a party name. Ex "BSc, PhD"')
    parser.add_argument(
        'idir_username',
        type=str,
        store_missing=False,
        help='The IDIR username of the party. Ex "IDIR\JSMITH"')
    parser.add_argument(
        'set_to_inspector',
        type=bool,
        store_missing=False,
        help='Identifies if current party is inspector')
    parser.add_argument(
        'set_to_project_lead',
        type=bool,
        store_missing=False,
        help='Identifies if current party is project lead')
    parser.add_argument(
        'inspector_start_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        help='Identifies if current party is inspector')
    parser.add_argument(
        'inspector_end_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        help='Identifies if current party is inspector')
    parser.add_argument(
        'project_lead_start_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        help='Identifies if current party is project lead')
    parser.add_argument(
        'project_lead_end_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        help='Identifies if current party is project lead')
    parser.add_argument(
        'signature',
        type=str,
        store_missing=False,
    )

    parser.add_argument(
        'organization_guid',
        type=str,
        store_missing=False,
        help='GUID of Party (organization) this party should be associated with'
    )

    PARTY_LIST_RESULT_LIMIT = 25

    @api.doc(
        description='Fetch a party by guid', params={
            'party_guid': 'guid of the party to fetch',
        })
    @requires_role_view_all
    @api.marshal_with(PARTY, code=200)
    def get(self, party_guid):
        party = Party.find_by_party_guid(party_guid)
        if not party:
            raise NotFound('Party not found')
        return party

    def _save_new_party_business_appointment(self,
                                             business_role,
                                             party_business_role_code,
                                             party_guid,
                                             start_date=None,
                                             end_date=None):

        update_end_date = business_role and business_role.start_date == start_date.date() and (
            end_date == None or business_role.end_date != end_date.date())
        update_start_date = business_role and (business_role.end_date == None
                                               or business_role.end_date == end_date.date()
                                               ) and business_role.start_date != start_date.date()

        if update_end_date:
            business_role.end_date = end_date
            business_role.save()
            cache.delete(GET_ALL_PROJECT_LEADS_KEY)
        elif update_start_date:
            business_role.start_date = start_date
            business_role.save()
            cache.delete(GET_ALL_PROJECT_LEADS_KEY)
        else:
            new_bappt = PartyBusinessRoleAppointment.create(party_business_role_code, party_guid,
                                                            start_date, end_date)
            try:
                new_bappt.save()
            except alch_exceptions.IntegrityError as e:
                if "daterange_excl" in str(e):
                    role = "inspector" if party_business_role_code == 'INS' else 'project lead'
                    raise BadRequest(f'Date ranges for {role} appointment must not overlap')

    @api.expect(parser)
    @api.doc(
        description='Update a party by guid', params={'party_guid': 'guid of the party to update.'})
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    @api.marshal_with(PARTY, code=200)
    def put(self, party_guid):
        if is_minespace_user():
            user = bceid_username()
            current_app.logger.debug('**********************')
            current_app.logger.debug(user)
            current_app.logger.debug('**********************')
            minespace_user = MinespaceUser.find_by_email(user + "@bceid")
            if not minespace_user:
                raise BadRequest('User not found.')

            party_appointments = MinePartyAppointment.find_by_party_guid(party_guid)

            if not party_appointments:
                raise BadRequest('User does not have access to this party.')
            if not next((appointment for appointment in party_appointments if
                         appointment.mine.mine_guid in minespace_user.mines), None):
                raise BadRequest('User does not have access to this party.')

        data = PartyResource.parser.parse_args()
        existing_party = Party.find_by_party_guid(party_guid)
        if not existing_party:
            raise NotFound('Party not found.')

        current_app.logger.info(f'Updating {existing_party} with {data}')
        for key, value in data.items():
            if key in ['party_type_code', 'signature']:
                continue  # non-editable fields from put
            setattr(existing_party, key, value)

        validate_phone_no(existing_party.phone_no)

        # We are now allowing parties to be created without an address
        if (data.get('suite_no') or data.get('address_line_1') or data.get('address_line_2')
                or data.get('city') or data.get('sub_division_code')
                or data.get('post_code')):                                                   # and check that we are changing the address
            if len(existing_party.address) == 0:
                address = Address.create()
                existing_party.address.append(address)

            for key, value in data.items():
                setattr(existing_party.address[0], key, value)

        # admin only can set inspector and project lead roles as well as signature
        if jwt.validate_roles([MINE_ADMIN]):
            signature = data.get('signature') if data.get('signature') else None
            today = datetime.now(timezone.utc).date()
            business_roles = PartyBusinessRoleAppointment.get_current_business_appointments(
                existing_party.party_guid, ("INS", "PRL"))

            current_app.logger.debug(f'business_role: {business_roles}')

            inspector_role = None
            project_lead_role = None
            for role in business_roles:
                if role.party_business_role_code == "INS":
                    inspector_role = role
                elif role.party_business_role_code == 'PRL':
                    project_lead_role = role

            if existing_party.signature != signature:
                existing_party.signature = signature

            if data.get("set_to_inspector"):
                start_date = data.inspector_start_date if data.get(
                    "inspector_start_date") else datetime.now(timezone.utc)
                end_date = data.inspector_end_date if data.get("inspector_end_date") else None
                self._save_new_party_business_appointment(inspector_role, "INS", party_guid,
                                                          start_date, end_date)
                cache.delete(GET_ALL_INSPECTORS_KEY)
            # deactivate inspector
            elif inspector_role:
                end_date = data.get("inspector_end_date")
                if end_date and end_date.date() <= today:
                    pass
                else:
                    inspector_role.end_date = today
                    inspector_role.save()
                    cache.delete(GET_ALL_INSPECTORS_KEY)

            if data.get("set_to_project_lead"):
                start_date = data.project_lead_start_date if data.get(
                    "project_lead_start_date") else datetime.now(timezone.utc)
                end_date = data.project_lead_end_date if data.get("project_lead_end_date") else None
                self._save_new_party_business_appointment(project_lead_role, "PRL", party_guid,
                                                          start_date, end_date)
                cache.delete(GET_ALL_PROJECT_LEADS_KEY)

            # deactivate project lead
            elif project_lead_role:
                end_date = data.get("project_lead_end_date")
                if end_date and end_date.date() <= today:
                    pass
                else:
                    project_lead_role.end_date = today
                    project_lead_role.save()
                    cache.delete(GET_ALL_PROJECT_LEADS_KEY)

        existing_party.save()
        return existing_party

    @api.doc(
        description='Delete a party by guid', params={'party_guid': 'guid of the party to delete.'})
    @requires_role_mine_admin
    def delete(self, party_guid):
        party = Party.find_by_party_guid(party_guid)
        if not party:
            raise NotFound(f'Party guid with "{party_guid}" not found.')

        mine_party_appts = MinePartyAppointment.find_by_party_guid(party_guid)
        for mine_party_appt in mine_party_appts:
            mine_party_appt.deleted_ind = True
            mine_party_appt.save()

        party.deleted_ind = True
        party.save()
        return ('', 204)
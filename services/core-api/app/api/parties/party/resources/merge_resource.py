from flask_restplus import Resource
from werkzeug.exceptions import BadRequest, NotFound

from app.extensions import api
from app.api.utils.access_decorators import requires_role_mds_administrative_users
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.parties.party.models.party import Party
from app.api.parties.party.models.address import Address
from app.api.securities.models.bond import Bond
from app.api.parties.response_models import PARTY


class MergeResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'party_guids',
        type=list,
        location='json',
        store_missing=False,
        help='The list of party GUIDs to merge.',
        required=True)
    parser.add_argument(
        'party',
        type=dict,
        location='json',
        help='The data used to create the new "merged" party record.',
        store_missing=False,
        required=True)

    @api.expect(parser)
    @api.doc(description='Merge data from multiple parties into a single new record.')
    @requires_role_mds_administrative_users
    @api.marshal_with(PARTY, code=200)
    def post(self):
        data = self.parser.parse_args()

        # Get the parties to be merged.
        party_guids = data.get('party_guids', [])
        if not party_guids:
            raise BadRequest('At least one party GUID must be provided to merge!')

        parties = []
        for party_guid in party_guids:
            party = Party.find_by_party_guid(party_guid)
            if party is None:
                raise NotFound(f'Party with party_guid {party_guid} not found.')
            parties.append(party)

        # Validate the parties to be merged.
        party_data = data.get('party', {})
        party_type_code = party_data.get('party_type_code')
        for party in parties:

            # Cannot merge parties of different types.
            if party.party_type_code != party_type_code:
                raise BadRequest('Cannot merge parties of different types.')

            # Cannot merge parties that are deleted.
            if party.deleted_ind:
                raise BadRequest('Cannot merge parties that are deleted.')

            # Cannot merge parties that have already been merged.
            if party.merged_party_guid:
                raise BadRequest('Cannot merge parties that have already been merged.')

            # Cannot merge parties that are Permittees.
            for mpa in party.mine_party_appt:
                if mpa.mine_party_appt_type_code == 'PMT':
                    raise BadRequest('Cannot merge parties that are Permittees.')

            # Cannot merge parties that are Inspectors.
            for bra in party.business_role_appts:
                if bra.party_business_role_code == 'INS':
                    raise BadRequest('Cannot merge parties that are Inspectors.')

            # Cannot merge parties that have signatures.
            if party.signature:
                raise BadRequest('Cannot merge parties that have signatures.')

            # Cannot merge parties that are associated with an OrgBook entity.
            if party.party_orgbook_entity:
                raise BadRequest('Cannot merge parties that are associated with an OrgBook entity.')

        # Create the new party record using the merged party data.
        party_name = party_data.get('party_name')
        phone_no = party_data.get('phone_no')
        email = party_data.get('email')
        first_name = party_data.get('first_name')
        phone_ext = party_data.get('phone_ext')
        merged_party = Party.create(party_name, phone_no, party_type_code, email, first_name,
                                    phone_ext)

        # Create the new address record (if applicable).
        address_data = party_data.get('address', {})
        suite_no = address_data.get('suite_no')
        address_line_1 = address_data.get('address_line_1')
        address_line_2 = address_data.get('address_line_2')
        city = address_data.get('city')
        sub_division_code = address_data.get('sub_division_code')
        post_code = address_data.get('post_code')
        address_type_code = address_data.get('address_type_code')
        if (suite_no or address_line_1 or address_line_2 or city or sub_division_code or post_code or address_type_code):
            merged_address = Address.create(suite_no, address_line_1, address_line_2, city,
                                            sub_division_code, post_code, address_type_code)
            merged_party.address.append(merged_address)

        # Delete the addresses of the merged parties.
        for party in parties:
            for address in party.address:
                address.delete(False)

        # Update the merged appointment records.
        for party in parties:

            # Handle NoW Party Appointments.
            for npa in party.now_party_appt:
                npa.merged_from_party_guid = npa.party_guid
                npa.party = merged_party
                npa.save(False)

            # Handle Mine Party Appointments.
            for mpa in party.mine_party_appt:
                mpa.merged_from_party_guid = mpa.party_guid
                mpa.party = merged_party
                mpa.save(False)

            # Handle Business Role Appointments.
            for bra in party.business_role_appts:
                bra.merged_from_party_guid = bra.party_guid
                bra.party = merged_party
                bra.save(False)

        # Update all foreign key relationships.
        # NOTE: All newly introduced party foreign keys will need to be addressed here!
        # NOTE: When supported, NoW inspector GUIDs, incident inspector GUIDs, variance inspector GUIDs, OrgBook entity party GUIDs, and other foreign key relationships, will need to be addressed here!
        for party in parties:

            # Handle bond "payer party".
            bonds = Bond.find_by_payer_party_guid(party.party_guid) or []
            for bond in bonds:
                bond.payer_party_guid = merged_party.party_guid
                bond.save(False)

        # Set the "merged party" GUID for each of the merged parties.
        for party in parties:
            party.delete(False)
            party.merged_party_guid = merged_party.party_guid
            party.save(False)

        merged_party.save()
        return merged_party

from decimal import Decimal
from datetime import datetime, timezone
from flask_restplus import Resource, reqparse
from werkzeug.exceptions import NotFound

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_mine_edit
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.mine.models.mine import Mine
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.api.mines.response_models import MINE_TSF_MODEL

from app.api.utils.access_decorators import requires_any_of, MINE_EDIT, MINESPACE_PROPONENT, is_minespace_user

class MineTailingsStorageFacilityResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'mine_tailings_storage_facility_name',
        type=str,
        trim=True,
        help='Name of the tailings storage facility.',
        required=True)
    parser.add_argument(
        'longitude',
        type=lambda x: Decimal(x) if x else None,
        help='Longitude point for the mine.',
        location='json')
    parser.add_argument(
        'latitude',
        type=lambda x: Decimal(x) if x else None,
        help='Latitude point for the mine.',
        location='json')
    parser.add_argument(
        'consequence_classification_status_code',
        type=str,
        trim=True,
        help='Risk Severity Classification',
        required=True)
    parser.add_argument(
        'tsf_operating_status_code',
        type=str,
        trim=True,
        help='Operating Status of the storage facility',
        required=True)
    parser.add_argument(
        'itrb_exemption_status_code',
        type=str,
        trim=True,
        help='Risk Severity Classification',
        required=True)
    parser.add_argument(
        'eor_party_guid',
        type=str,
        help='GUID of the party that is the Engineer of Record for this TSF.',
        location='json',
        store_missing=False)

    @api.doc(description='Updates an existing tailing storage facility for the given mine')
    @requires_any_of([MINESPACE_PROPONENT, MINE_EDIT])
    @api.marshal_with(MINE_TSF_MODEL) 
    def put(self, mine_guid, mine_tailings_storage_facility_guid):
        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine:
            raise NotFound('Mine not found.')

        mine_tsf = MineTailingsStorageFacility.find_by_tsf_guid(mine_tailings_storage_facility_guid)

        if not mine_tsf:
            raise NotFound("Tailing Storage Facility not found")

        data = self.parser.parse_args()
        eor_party_guid = data.get('eor_party_guid')
        if eor_party_guid != None and (mine_tsf.engineer_of_record is None
                                       or eor_party_guid != mine_tsf.engineer_of_record.party_guid):
            if mine_tsf.engineer_of_record:
                mine_tsf.engineer_of_record.end_date = datetime.now(tz=timezone.utc)
            new_eor = MinePartyAppointment.create(
                mine=mine,
                tsf=mine_tsf,
                party_guid=eor_party_guid,
                mine_party_appt_type_code='EOR',
                processed_by=self.get_user_info(),
                start_date=datetime.now(tz=timezone.utc))
            related_guid = mine_tsf.mine_tailings_storage_facility_guid
            new_eor.assign_related_guid('EOR', related_guid)
            new_eor.save(commit=False)

        for key, value in data.items():
            if key in ('eor_party_guid'):
                continue
            setattr(mine_tsf, key, value)

        mine_tsf.save()

        if is_minespace_user():
            mine_tsf.send_email_tsf_update()
            
        return mine_tsf
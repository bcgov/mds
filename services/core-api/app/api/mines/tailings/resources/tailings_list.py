from decimal import Decimal
from datetime import datetime, timezone
from flask import current_app
from flask_restplus import Resource, reqparse
from werkzeug.exceptions import InternalServerError, NotFound, BadRequest

from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_view_all, requires_any_of, \
    MINESPACE_PROPONENT, EDIT_TSF
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.mine.models.mine import Mine
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility, StorageLocation, TailingsStorageFacilityType, FacilityType
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.response_models import MINE_TSF_MODEL


class MineTailingsStorageFacilityListResource(Resource, UserMixin):
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
        help='Risk Severity Classification')
    parser.add_argument(
        'tsf_operating_status_code',
        type=str,
        trim=True,
        help='Operating Status of the storage facility')
    parser.add_argument(
        'itrb_exemption_status_code',
        type=str,
        trim=True,
        help='Risk Severity Classification')
    parser.add_argument(
        'eor_party_guid',
        type=str,
        help='GUID of the party that is the Engineer of Record for this TSF.',
        location='json',
        store_missing=False)
    parser.add_argument(
        'notes',
        type=str,
        help='Any additional notes to be added to the tailing.',
        trim=True,
        location='json')
    parser.add_argument(
        'storage_location',
        type=StorageLocation,
        help='Storage location of the tailings (above or below ground)',
        location='json',
        choices=list(StorageLocation),
        store_missing=False)
    parser.add_argument(
        'facility_type',
        type=FacilityType,
        help='Type of facility.',
        location='json',
        choices=list(FacilityType),
        store_missing=False)
    parser.add_argument(
        'tailings_storage_facility_type',
        type=TailingsStorageFacilityType,
        help='Type of tailings storage facility.',
        location='json',
        choices=list(TailingsStorageFacilityType),
        store_missing=False)
    parser.add_argument(
        'mines_act_permit_no',
        type=str,
        help='Mines Act Permit Number',
        location='json',
        store_missing=False)

    @api.doc(description='Gets the tailing storage facilites for the given mine')
    @api.marshal_with(
        MINE_TSF_MODEL, envelope='mine_tailings_storage_facilities', as_list=True, code=200)
    @requires_role_view_all
    def get(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found.')
        return mine.mine_tailings_storage_facilities

    @api.doc(description='Creates a new tailing storage facility for the given mine')
    @api.marshal_with(MINE_TSF_MODEL, code=201)
    @requires_any_of([EDIT_TSF, MINESPACE_PROPONENT])
    def post(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found.')

        data = self.parser.parse_args()

        mine_tsf_list = mine.mine_tailings_storage_facilities
        is_mine_first_tsf = len(mine_tsf_list) == 0

        # Check if the mine already has a TSF with the same name
        for mine_tsf in mine_tsf_list:
            if mine_tsf.mine_tailings_storage_facility_name == data.get(
                    'mine_tailings_storage_facility_name'):
                raise BadRequest(
                    'Mine already has a TSF with the same name: {}'.format(
                        data.get('mine_tailings_storage_facility_name')))

        mine_tsf = MineTailingsStorageFacility.create(
            mine,
            mine_tailings_storage_facility_name=data['mine_tailings_storage_facility_name'],
            latitude=data['latitude'],
            longitude=data['longitude'],
            consequence_classification_status_code=data['consequence_classification_status_code'],
            itrb_exemption_status_code=data['itrb_exemption_status_code'],
            tsf_operating_status_code=data['tsf_operating_status_code'],
            notes=data['notes'],
            storage_location=data.get('storage_location'),
            facility_type=FacilityType.tailings_storage_facility
            if data.get('facility_type') == None else data.get('facility_type'),
            tailings_storage_facility_type=data.get('tailings_storage_facility_type'),
            mines_act_permit_no=data.get('mines_act_permit_no'),
        )

        mine.mine_tailings_storage_facilities.append(mine_tsf)

        if is_mine_first_tsf:
            try:
                tsf_required_reports = MineReportDefinition.find_required_reports_by_category('TSF')

                for tsf_req_doc in tsf_required_reports:
                    calculated_due_date = tsf_req_doc.default_due_date or datetime.utcnow()
                    MineReport.create(
                        mine_report_definition_id=tsf_req_doc.mine_report_definition_id,
                        mine_guid=mine.mine_guid,
                        due_date=calculated_due_date,
                        received_date=None,
                        submission_year=calculated_due_date.year - 1,
                        description_comment=None,
                        submitter_name=None,
                        permit_id=None)
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(str(e))
                raise InternalServerError(str(e) + ", tsf not created")

        eor_party_guid = data.get('eor_party_guid')
        if eor_party_guid is not None:
            new_eor = MinePartyAppointment.create(
                mine=mine,
                tsf=mine_tsf,
                party_guid=eor_party_guid,
                mine_party_appt_type_code='EOR',
                processed_by=self.get_user_info(),
                start_date=datetime.now(tz=timezone.utc))
            related_guid = mine_tsf.mine_tailings_storage_facility_guid
            new_eor.assign_related_guid('EOR', related_guid)
            new_eor.save()

        mine.save()
        return mine_tsf, 201

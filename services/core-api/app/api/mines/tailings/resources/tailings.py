from datetime import datetime, timezone, timedelta
from decimal import Decimal

from app.api.utils.feature_flag import Feature, is_feature_enabled
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAcknowledgedStatus

from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointmentStatus

from flask_restx import Resource, reqparse
from werkzeug.exceptions import NotFound, BadRequest

from app.api.mines.mine.models.mine import Mine
from app.api.mines.response_models import MINE_TSF_DETAIL_MODEL, MINE_TSF_MODEL
from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility, FacilityType
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.api.utils.access_decorators import VIEW_ALL, requires_any_of, EDIT_TSF, MINESPACE_PROPONENT, is_minespace_user
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api


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
        help='Longitude point for the mine.')
    parser.add_argument(
        'latitude',
        type=lambda x: Decimal(x) if x else None,
        help='Latitude point for the mine.')
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
        store_missing=False)
    parser.add_argument(
        'tqp_party_guid',
        type=str,
        help='GUID of the party that is the Qualified Person for this TSF.',
        store_missing=False)
    parser.add_argument(
        'notes',
        type=str,
        help='Any additional notes to be added to the tailing.',
        trim=True)
    parser.add_argument(
        'storage_location',
        type=str,
        help='Storage location of the tailings (above or below ground)',
        store_missing=False)
    parser.add_argument(
        'facility_type',
        type=str,
        help='Type of facility.',
        store_missing=False)
    parser.add_argument(
        'tailings_storage_facility_type',
        type=str,
        help='Type of tailings storage facility.',
        store_missing=False)
    parser.add_argument(
        'mines_act_permit_no',
        type=str,
        help='Mines Act Permit Number',
        store_missing=False)
    parser.add_argument(
        'is_submitting',
        type=bool,
        store_missing=False
    )

    @api.doc(description='Get a tailing storage facility for the given mine')
    @requires_any_of([MINESPACE_PROPONENT, EDIT_TSF, VIEW_ALL])
    @api.marshal_with(MINE_TSF_DETAIL_MODEL)
    def get(self, mine_guid, mine_tailings_storage_facility_guid):
        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine:
            raise NotFound('Mine not found')

        mine_tsf = MineTailingsStorageFacility.find_by_tsf_guid(mine_tailings_storage_facility_guid)

        if not mine_tsf or str(mine_tsf.mine_guid) != mine_guid:
            raise NotFound('Tailing Storage Facility not found')

        return mine_tsf


    @api.doc(description='Updates an existing tailing storage facility for the given mine')
    @requires_any_of([MINESPACE_PROPONENT, EDIT_TSF])
    @api.marshal_with(MINE_TSF_DETAIL_MODEL)
    def put(self, mine_guid, mine_tailings_storage_facility_guid):
        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine:
            raise NotFound('Mine not found.')

        mine_tsf: MineTailingsStorageFacility = MineTailingsStorageFacility.find_by_tsf_guid(mine_tailings_storage_facility_guid)

        if not mine_tsf:
            raise NotFound("Tailing Storage Facility not found")

        data = self.parser.parse_args()

        is_submitting = data.get('is_submitting')
        eor_party_guid = data.get('eor_party_guid')
        has_new_eor = eor_party_guid != None and (mine_tsf.engineer_of_record is None or eor_party_guid != mine_tsf.engineer_of_record.party_guid)
        if has_new_eor:
            if mine_tsf.engineer_of_record:
                mine_tsf.engineer_of_record.end_date = datetime.now(tz=timezone.utc)

            if is_minespace_user():
                # EORs created through minespace should have a status of "pending"
                new_status = MinePartyAppointmentStatus.pending
                mine_party_acknowledgement_status = MinePartyAcknowledgedStatus.not_acknowledged

                if is_feature_enabled(Feature.TSF_V2):
                    if is_submitting:
                        calculated_due_date = datetime.now() + timedelta(hours=72)
                        mine_report_definition = MineReportDefinition.find_one_by_section('10', '4', '1', '2')
                        if not mine_report_definition:
                            raise NotFound('EOR report definition not found by section')

                        # Create a report request for a new EOR letter
                        MineReport.create(
                            mine_report_definition_id=mine_report_definition.mine_report_definition_id,
                            mine_guid=mine.mine_guid,
                            due_date=calculated_due_date,
                            received_date=None,
                            submission_year=calculated_due_date.year,
                            description_comment=None,
                            submitter_name=None,
                            permit_id=None,
                            add_to_session=True,
                            system_created=True)
            else:
                # TSF_V2 - this can probably be removed with the feature flag
                mine_party_acknowledgement_status = MinePartyAcknowledgedStatus.acknowledged
                new_status = MinePartyAppointmentStatus.active

        # If feature is not enabled, save the appointment in here rather than it have been created
        # within the TSF draft process
        if not is_feature_enabled(Feature.TSF_V2):
            new_eor = MinePartyAppointment.create(
                mine=mine,
                tsf=mine_tsf,
                party_guid=eor_party_guid,
                mine_party_appt_type_code='EOR',
                processed_by=self.get_user_info(),
                start_date=datetime.now(tz=timezone.utc),
                status = new_status,
                mine_party_acknowledgement_status=mine_party_acknowledgement_status
            )

            related_guid = mine_tsf.mine_tailings_storage_facility_guid
            new_eor.assign_related_guid('EOR', related_guid)
            new_eor.save(commit=False)

        if is_feature_enabled(Feature.TSF_V2):
            tqp_party_guid = data.get('tqp_party_guid')
            has_new_qp = tqp_party_guid != None and (mine_tsf.qualified_person is None or tqp_party_guid != mine_tsf.qualified_person.party_guid)
            if has_new_qp:

                if is_minespace_user() and is_submitting:
                    calculated_due_date = datetime.now() + timedelta(hours=72)
                    mine_report_definition = MineReportDefinition.find_one_by_section('10', '4', '2', '1(c)')
                    if not mine_report_definition:
                        raise NotFound('QP report definition not found by section')

                    # Create a report request for a new EOR letter
                    MineReport.create(
                        mine_report_definition_id=mine_report_definition.mine_report_definition_id,
                        mine_guid=mine.mine_guid,
                        due_date=calculated_due_date,
                        received_date=None,
                        submission_year=calculated_due_date.year,
                        description_comment=None,
                        submitter_name=None,
                        permit_id=None,
                        add_to_session=True,
                        system_created=True)

        for key, value in data.items():
            if key in ('eor_party_guid'):
                continue
            if key in ('facility_type', 'storage_location', 'tailings_storage_facility_type'):
                continue
            setattr(mine_tsf, key, value)

        facility_type = data.get('facility_type')
        if facility_type != None:
            setattr(mine_tsf, 'facility_type', facility_type)
        else:
            setattr(mine_tsf, 'facility_type', FacilityType.tailings_storage_facility)

        storage_location = data.get('storage_location')
        if storage_location != None:
            setattr(mine_tsf, 'storage_location', storage_location)

        tailings_storage_facility_type = data.get('tailings_storage_facility_type')
        if tailings_storage_facility_type != None:
            setattr(mine_tsf, 'tailings_storage_facility_type', tailings_storage_facility_type)

        if is_submitting or is_feature_enabled(Feature.TSF_V2) == False:
            try:
                mine_tsf.submit()
            except Exception as error:
                raise BadRequest(error)
        else:
            mine_tsf.save_draft()

        if is_minespace_user():
            mine_tsf.send_email_tsf_update()

        return mine_tsf

from datetime import datetime
from flask_restplus import Resource, reqparse, inputs
from flask import current_app
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.parties.party.models.party import Party
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.extensions import api, jwt
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit, requires_role_mine_admin
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.response_models import PERMIT_AMENDMENT_MODEL
from app.api.utils.access_decorators import MINE_ADMIN, EDIT_HISTORICAL_PERMIT_AMENDMENTS

ROLES_ALLOWED_TO_CREATE_HISTORICAL_AMENDMENTS = [MINE_ADMIN, EDIT_HISTORICAL_PERMIT_AMENDMENTS]


def validate_issue_date(issue_date, permit_amendment_type_code, permit_guid, mine_guid):
    if permit_amendment_type_code == 'OGP':
        return

    original_permit_amendment = PermitAmendment.find_original_permit_amendment_by_permit_guid(
        permit_guid, mine_guid)

    if not jwt.validate_roles(
            ROLES_ALLOWED_TO_CREATE_HISTORICAL_AMENDMENTS
    ) and original_permit_amendment and original_permit_amendment.issue_date:
        if issue_date and original_permit_amendment.issue_date > issue_date.date():
            raise AssertionError(
                'Permit amendment issue date cannot be before the permits First Issued date.')


class PermitAmendmentListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)

    parser.add_argument(
        'permittee_party_guid',
        type=str,
        help='GUID of the party that is the permittee for this permit.',
        location='json',
        store_missing=False)
    parser.add_argument(
        'received_date', location='json', type=inputs.datetime_from_iso8601, store_missing=False)
    parser.add_argument(
        'issue_date', location='json', type=inputs.datetime_from_iso8601, store_missing=False)
    parser.add_argument(
        'authorization_end_date',
        location='json',
        type=inputs.datetime_from_iso8601,
        store_missing=False)
    parser.add_argument(
        'permit_amendment_type_code', type=str, location='json', store_missing=False)
    parser.add_argument(
        'permit_amendment_status_code', type=str, location='json', store_missing=False)
    parser.add_argument('description', type=str, location='json', store_missing=False)
    parser.add_argument('security_adjustment', type=str, location='json', store_missing=False)
    parser.add_argument('uploadedFiles', type=list, location='json', store_missing=False)
    parser.add_argument(
        'now_application_guid',
        type=str,
        location='json',
        help='The now_application_guid this permit is related to.')
    parser.add_argument(
        'lead_inspector_title',
        type=str,
        location='json',
        help='Title of the lead inspector for this permit.')
    parser.add_argument(
        'regional_office', type=str, location='json', help='The regional office for this permit.')
    parser.add_argument(
        'is_historical_amendment', type=bool, location='json', help='Is it a historical amendment')

    @api.doc(params={
        'permit_amendment_guid': 'Permit amendment guid.',
        'permit_guid': 'Permit GUID'
    })
    @requires_role_edit_permit
    @api.marshal_with(PERMIT_AMENDMENT_MODEL, code=201)
    def post(self, mine_guid, permit_guid, permit_amendment_guid=None):
        if permit_amendment_guid:
            raise BadRequest('Unexpected permit_amendement_guid.')

        permit = Permit.find_by_permit_guid(permit_guid)
        if not permit:
            raise NotFound('Permit does not exist.')

        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound("Mine does not exist")
        # if str(pid) not in [m.mine_guid for m in permit.all_mines]:
        #     raise BadRequest('Permits mine_guid and provided mine_guid mismatch.')

        data = self.parser.parse_args()
        current_app.logger.info(f'creating permit_amendment with >> {data}')

        validate_issue_date(
            data.get('issue_date'), data.get('permit_amendment_type_code'), permit.permit_guid,
            mine_guid)

        permittee_party_guid = None
        if not data.get('is_historical_amendment', False):
            permittee_party_guid = data.get('permittee_party_guid', None)

        permittee_end_date = None
        if permittee_party_guid:
            party = Party.find_by_party_guid(data.get('permittee_party_guid'))
            if not party:
                raise NotFound('Permittee party not found')

            is_historical_permit = False
            permit_issue_datetime = data.get('issue_date')
            # convert permit_issue_date to a date object to compare with permittee start_date,
            #Both dates are stored in the DB as Dates, and are being converted to SQLAlchemy dateTimes in the modals, but for some reason being returned as Python Dates.
            if permit_issue_datetime:
                permit_issue_date = datetime.date(permit_issue_datetime)

            permittees = permit.permittee_appointments
            if permittees:
                new_end_dates = MinePartyAppointment.find_appointment_end_dates(
                    permit.permit_id, permit_issue_date)

                for permittee in permittees:
                    # check if the new appointment is older than the current appointment, if so create a new permittee appointment
                    if permittee.start_date > permit_issue_date:
                        is_historical_permit = True
                    else:
                        # if the amendment is the newest, change the end dates of the other appointments
                        position = new_end_dates.index(permittee.start_date)
                        if new_end_dates.index(permittee.start_date) == 0:
                            permittee.save()
                        else:
                            permittee.end_date = new_end_dates[position - 1]
                            permittee.save()
                position = new_end_dates.index(permit_issue_date)
                permittee_end_date = new_end_dates[position - 1] if is_historical_permit else None

            # create a new appointment, so every amendment is associated with a permittee
            new_permittee = MinePartyAppointment.create(
                None,
                data.get('permittee_party_guid'),
                mine_party_appt_type_code='PMT',
                processed_by=self.get_user_info(),
                start_date=permit_issue_date,
                end_date=permittee_end_date,
                permit=permit)

            new_permittee.save()

        permit_amendment_type_code = data.get('permit_amendment_type_code')
        permit_amendment_status_code = data.get('permit_amendment_status_code')
        new_pa = PermitAmendment.create(
            permit,
            mine,
            received_date=data.get('received_date'),
            issue_date=data.get('issue_date'),
            authorization_end_date=data.get('authorization_end_date'),
            permit_amendment_type_code=permit_amendment_type_code
            if permit_amendment_type_code else 'AMD',
            description=data.get('description'),
            security_adjustment=data.get('security_adjustment'),
            permit_amendment_status_code=permit_amendment_status_code
            if permit_amendment_status_code else 'ACT',
            lead_inspector_title=data.get('lead_inspector_title'),
            regional_office=data.get('regional_office'),
            now_application_guid=data.get('now_application_guid'),
        )

        uploadedFiles = data.get('uploadedFiles', [])
        for newFile in uploadedFiles:
            new_pa_doc = PermitAmendmentDocument(
                document_name=newFile['fileName'],
                document_manager_guid=newFile['document_manager_guid'],
                mine_guid=mine.mine_guid,
            )
            new_pa.related_documents.append(new_pa_doc)

        new_pa.save()
        return new_pa


class PermitAmendmentResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)

    parser.add_argument(
        'permittee_party_guid',
        type=str,
        help='GUID of the party that is the permittee for this permit.',
        location='json',
        store_missing=False)
    parser.add_argument(
        'received_date',
        location='json',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False)
    parser.add_argument(
        'issue_date',
        location='json',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False)
    parser.add_argument(
        'authorization_end_date',
        location='json',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False)
    parser.add_argument(
        'permit_amendment_type_code', type=str, location='json', store_missing=False)
    parser.add_argument(
        'permit_amendment_status_code', type=str, location='json', store_missing=False)
    parser.add_argument('description', type=str, location='json', store_missing=False)
    parser.add_argument('security_adjustment', type=str, location='json', store_missing=False)
    parser.add_argument(
        'security_received_date',
        location='json',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False)
    parser.add_argument('uploadedFiles', type=list, location='json', store_missing=False)
    parser.add_argument(
        'lead_inspector_title',
        type=str,
        location='json',
        store_missing=False,
        help='Title of the lead inspector for this permit.')
    parser.add_argument(
        'regional_office',
        type=str,
        location='json',
        store_missing=False,
        help='The regional office for this permit.')

    @api.doc(params={'permit_amendment_guid': 'Permit amendment guid.'})
    @requires_role_view_all
    @api.marshal_with(PERMIT_AMENDMENT_MODEL, code=200)
    def get(self, mine_guid, permit_guid, permit_amendment_guid):
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not permit_amendment:
            raise NotFound("Permit Amendment not found.")
        if not str(permit_amendment.mine_guid) == mine_guid:
            raise BadRequest('Permits mine_guid and supplied mine_guid mismatch.')
        return permit_amendment

    @api.doc(params={
        'permit_amendment_guid': 'Permit amendment guid.',
        'permit_guid': 'Permit GUID'
    })
    @requires_role_edit_permit
    @api.marshal_with(PERMIT_AMENDMENT_MODEL, code=200)
    def put(self, mine_guid, permit_guid, permit_amendment_guid):
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not permit_amendment:
            raise NotFound("Permit Amendment not found.")
        if not str(permit_amendment.mine_guid) == mine_guid:
            raise BadRequest('Permits mine_guid and supplied mine_guid mismatch.')

        data = self.parser.parse_args()
        current_app.logger.info(f'updating {permit_amendment} with >> {data}')

        validate_issue_date(
            data.get('issue_date'), data.get('permit_amendment_type_code'),
            permit_amendment.permit_guid, mine_guid)

        for key, value in data.items():
            if key == 'uploadedFiles':
                for newFile in value:
                    new_pa_doc = PermitAmendmentDocument(
                        document_name=newFile['fileName'],
                        document_manager_guid=newFile['document_manager_guid'],
                        mine_guid=permit_amendment.mine_guid,
                    )
                    permit_amendment.related_documents.append(new_pa_doc)
            else:
                setattr(permit_amendment, key, value)

        permit_amendment.save()

        return permit_amendment

    @api.doc(params={
        'permit_amendment_guid': 'Permit amendment guid.',
        'permit_guid': 'Permit GUID'
    })
    @requires_role_mine_admin
    @api.response(204, 'Successfully deleted.')
    def delete(self, mine_guid, permit_guid, permit_amendment_guid):
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not permit_amendment:
            raise NotFound("Permit Amendment not found.")
        if not str(permit_amendment.mine_guid) == mine_guid:
            raise BadRequest('Permits mine_guid and supplied mine_guid mismatch.')

        try:
            permit_amendment.delete()
        except Exception as e:
            raise BadRequest(e)

        return
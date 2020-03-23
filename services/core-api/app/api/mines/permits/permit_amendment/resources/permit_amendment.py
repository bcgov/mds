from datetime import datetime
from flask_restplus import Resource, reqparse, inputs
from flask import current_app
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound

from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.parties.party.models.party import Party
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit, requires_role_mine_admin
from app.api.utils.resources_mixins import UserMixin
from app.api.mines.response_models import PERMIT_AMENDMENT_MODEL


class PermitAmendmentListResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)

    parser.add_argument(
        'permittee_party_guid',
        type=str,
        help='GUID of the party that is the permittee for this permit.',
        location='json')
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
    parser.add_argument('uploadedFiles', type=list, location='json', store_missing=False)

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

        if not str(permit.mine_guid) == mine_guid:
            raise BadRequest('Permits mine_guid and provided mine_guid mismatch.')

        data = self.parser.parse_args()
        current_app.logger.info(f'creating permit_amendment with >> {data}')

        party = Party.find_by_party_guid(data.get('permittee_party_guid'))
        if not party:
            raise NotFound('Party not found')

        permittees = MinePartyAppointment.find_by_permit_guid(permit_guid)
        if not permittees:
            raise NotFound('Party appointments not found')

        permit_issue_datetime = data.get('issue_date')
        # convert permit_issue_date to a date object to compare with permittee start_date,
        #Both dates are stored in the DB as Dates, and are being converted to SQLAlchemy dateTimes in the modals, but for some reason being returned as Python Dates.
        permit_issue_date = datetime.date(permit_issue_datetime)
        is_historical_permit = False

        new_end_dates = MinePartyAppointment.find_appointment_end_dates(
            permit_guid, permit_issue_date)

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

        permittee_start_date = permit_issue_date
        position = new_end_dates.index(permit_issue_date)
        permittee_end_date = new_end_dates[position - 1] if is_historical_permit else None

        # create a new appointment, so every amendment is associated with a permittee
        new_permittee = MinePartyAppointment.create(
            permit.mine_guid,
            data.get('permittee_party_guid'),
            'PMT',
            self.get_user_info(),
            start_date=permittee_start_date,
            end_date=permittee_end_date,
            permit_guid=permit_guid)

        new_permittee.save()
        new_pa = PermitAmendment.create(
            permit,
            data.get('received_date'),
            data.get('issue_date'),
            data.get('authorization_end_date'),
            data.get('permit_amendment_type_code', 'AMD'),
            description=data.get('description'))

        uploadedFiles = data.get('uploadedFiles', [])
        for newFile in uploadedFiles:
            new_pa_doc = PermitAmendmentDocument(
                document_name=newFile['fileName'],
                document_manager_guid=newFile['document_manager_guid'],
                mine_guid=permit.mine_guid,
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
        location='json')
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
    parser.add_argument('security_total', type=str, location='json', store_missing=False)
    parser.add_argument('uploadedFiles', type=list, location='json', store_missing=False)

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

        permit_amendment.deleted_ind = True

        permit_amendment.save()
        return

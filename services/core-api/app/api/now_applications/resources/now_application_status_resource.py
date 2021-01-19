from datetime import datetime, timedelta, timezone
from flask_restplus import Resource, reqparse, inputs
from flask import current_app
from operator import attrgetter

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_edit_permit
from app.api.utils.resources_mixins import UserMixin
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.now_application_status import NOWApplicationStatus
from app.api.now_applications.models.now_application_progress import NOWApplicationProgress
from app.api.now_applications.response_models import NOW_APPLICATION_STATUS_CODES
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.parties.party_appt.models.mine_party_appt import MinePartyAppointment
from werkzeug.exceptions import BadRequest, NotFound, NotImplemented


class NOWApplicationStatusCodeResource(Resource, UserMixin):
    @api.doc(description='Get a list of all Notice of Work status codes.', params={})
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_STATUS_CODES, code=200, envelope='records')
    def get(self):
        return NOWApplicationStatus.get_all()


class NOWApplicationStatusResource(Resource, UserMixin):
    parser = reqparse.RequestParser(trim=True)
    parser.add_argument(
        'issue_date', location='json', type=inputs.datetime_from_iso8601, store_missing=False)
    parser.add_argument(
        'auth_end_date', location='json', type=inputs.datetime_from_iso8601, store_missing=False)
    parser.add_argument(
        'now_application_status_code',
        type=str,
        location='json',
        help='Whether the permit is an exploration permit or not.')
    parser.add_argument(
        'status_reason', type=str, location='json', help='Reason for rejecting the application.')
    parser.add_argument(
        'description', type=str, location='json', help='Description for permit amendment.')

    @api.doc(description='Update Status of an Application', params={})
    @requires_role_edit_permit
    def put(self, application_guid):
        data = self.parser.parse_args()
        issue_date = data.get('issue_date', None)
        auth_end_date = data.get('auth_end_date', None)
        status_reason = data.get('status_reason', None)
        description = data.get('description', None)
        now_application_status_code = data.get('now_application_status_code', None)

        now_application_identity = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application_identity:
            raise NotFound('No identity record for this application guid.')

        if now_application_identity.now_application_id is None:
            raise NotImplemented(
                'This application has not been imported. Please import an application before making changes.'
            )

        if now_application_status_code is not None and now_application_identity.now_application.now_application_status_code != now_application_status_code:
            # Approved
            if now_application_status_code == 'AIA':
                permit = Permit.find_by_now_application_guid(application_guid)
                if not permit:
                    raise NotFound('No permit found for this application.')

                permit_amendment = PermitAmendment.find_by_now_application_guid(application_guid)
                if not permit_amendment:
                    raise NotFound('No permit amendment found for this application.')

                # TODO improve this dates validation
                for contact in now_application_identity.now_application.contacts:
                    if contact.mine_party_appt_type_code == 'PMT' or contact.mine_party_appt_type_code == 'MMG':
                        new_appt_needed = False
                        current_apt = MinePartyAppointment.find_current_appointments(
                            permit_id=permit.permit_id
                            if contact.mine_party_appt_type_code == 'PMT' else None,
                            mine_guid=now_application_identity.mine.mine_guid
                            if contact.mine_party_appt_type_code == 'MMG' else None,
                            mine_party_appt_type_code=contact.mine_party_appt_type_code)
                        # A mine can only have one active Mine manager and a permit can only have oneactive permittee
                        if len(current_apt) > 1:
                            raise BadRequest(
                                'This mine has more than one mine manager. Resolve this and try again.'
                                if contact.mine_party_appt_type_code == 'MMG' else
                                'This permit has more than one permittee. Resolve this and try again.'
                            )

                        amendments = [
                            amendment for amendment in permit.permit_amendments
                            if amendment and amendment.issue_date
                        ]
                        if amendments:
                            latest_amendment = max(amendments, key=attrgetter('issue_date'))

                            if latest_amendment and latest_amendment.issue_date > issue_date.date():
                                raise BadRequest(
                                    f'You cannot set the issue date of permit {permit.permit_no} before the issue date of its most recent amendment, dated {latest_amendment.issue_date}.'
                                )

                        if len(current_apt) == 1 and current_apt[0].start_date > issue_date.date():
                            raise BadRequest(
                                f'You cannot set the issue date prior to the start date of {current_apt[0].start_date}.'
                            )

                #move out of draft, draft status on permit indicates that the permit amendment is first (original)
                if permit.permit_status_code == 'D':
                    permit.permit_status_code = 'O'
                    permit_amendment.permit_amendment_status_code = 'ACT'
                    permit_amendment.permit_amendment_type_code = 'OGP'

                if permit_amendment.permit_amendment_status_code == 'DFT':
                    permit_amendment.permit_amendment_status_code = 'ACT'

                permit.save()

                permit_amendment.issue_date = issue_date
                permit_amendment.authorization_end_date = auth_end_date
                permit_amendment.description = description

                # transfer reclamation security data from NoW to permit
                permit_amendment.liability_adjustment = now_application_identity.now_application.liability_adjustment
                permit_amendment.security_received_date = now_application_identity.now_application.security_received_date
                permit_amendment.security_not_required = now_application_identity.now_application.security_not_required
                permit_amendment.security_not_required_reason = now_application_identity.now_application.security_not_required_reason
                permit_amendment_document = [
                    doc for doc in now_application_identity.now_application.documents
                    if doc.now_application_document_type_code == 'PMA'
                    or doc.now_application_document_type_code == 'PMT'
                ][0]
                new_pa_doc = PermitAmendmentDocument(
                    mine_guid=permit_amendment.mine_guid,
                    document_manager_guid=permit_amendment_document.mine_document.
                    document_manager_guid,
                    document_name=permit_amendment_document.mine_document.document_name)

                permit_amendment.related_documents.append(new_pa_doc)

                permit_amendment.save()

                #create contacts
                for contact in now_application_identity.now_application.contacts:
                    if contact.mine_party_appt_type_code == 'PMT' or contact.mine_party_appt_type_code == 'MMG':
                        new_appt_needed = False
                        current_apt = MinePartyAppointment.find_current_appointments(
                            permit_id=permit.permit_id
                            if contact.mine_party_appt_type_code == 'PMT' else None,
                            mine_guid=now_application_identity.mine.mine_guid
                            if contact.mine_party_appt_type_code == 'MMG' else None,
                            mine_party_appt_type_code=contact.mine_party_appt_type_code)
                        # A mine can only have one active Mine manager and a permit can only have oneactive permittee
                        if len(current_apt) > 1:
                            raise BadRequest(
                                'This mine has more than one mine manager. Resolve this and try again.'
                                if contact.mine_party_appt_type_code == 'MMG' else
                                'This permit has more than one permittee. Resolve this and try again.'
                            )

                        # If there is a current appointment and it does not match the proposed appointment end the current and create a new one.
                        if len(current_apt) == 1:
                            if current_apt[0].party_guid != contact.party_guid:
                                new_appt_needed = True
                                current_apt[0].end_date = permit_amendment.issue_date - timedelta(
                                    days=1)
                                current_apt[0].save()

                        #if there is no current appointment create a new one.
                        if len(current_apt) == 0:
                            new_appt_needed = True

                        if new_appt_needed:
                            new_mpa = MinePartyAppointment.create(
                                mine=now_application_identity.mine
                                if contact.mine_party_appt_type_code == 'MMG' else None,
                                permit=permit
                                if contact.mine_party_appt_type_code == 'PMT' else None,
                                party_guid=contact.party_guid,
                                mine_party_appt_type_code=contact.mine_party_appt_type_code,
                                start_date=permit_amendment.issue_date,
                                end_date=None,
                                processed_by=self.get_user_info())
                            new_mpa.save()

            #TODO: Documents / CRR
            # Update NoW application and save status
            if now_application_status_code == 'REJ':
                for progress in now_application_identity.now_application.application_progress:
                    progress.end_date = datetime.now(tz=timezone.utc)
                for delay in now_application_identity.application_delays:
                    delay.end_date = datetime.now(tz=timezone.utc)

            now_application_identity.now_application.status_updated_date = datetime.utcnow()
            # set previous status
            now_application_identity.now_application.previous_application_status_code = now_application_identity.now_application.now_application_status_code
            now_application_identity.now_application.now_application_status_code = now_application_status_code
            now_application_identity.now_application.status_reason = status_reason
            now_application_identity.save()
        return 200
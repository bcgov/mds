from datetime import datetime, timedelta, timezone
from flask_restplus import Resource, reqparse, inputs
from flask import current_app
from operator import attrgetter
from werkzeug.exceptions import BadRequest, NotFound, NotImplemented

from app.extensions import api, db
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
from app.api.constants import PERMIT_LINKED_CONTACT_TYPES
from app.api.services.issue_to_orgbook_service import OrgBookIssuerService


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
        'status_reason',
        type=str,
        location='json',
        help='Reason for updating the status of the application.')
    parser.add_argument(
        'description', type=str, location='json', help='Description for the permit amendment.')
    parser.add_argument(
        'now_application_status_code',
        type=str,
        location='json',
        help='The new status of the application.')

    # TODO: Improve this endpoint by making it a transaction.
    @api.doc(description='Update the status of an application.')
    @requires_role_edit_permit
    def put(self, application_guid):
        data = self.parser.parse_args()
        issue_date = data.get('issue_date')
        auth_end_date = data.get('auth_end_date')
        status_reason = data.get('status_reason')
        description = data.get('description')
        now_application_status_code = data.get('now_application_status_code')

        now_application_identity = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application_identity:
            raise NotFound('No identity record for this application guid.')

        if now_application_identity.now_application_id is None:
            raise NotImplemented('Notices of Work must be imported before changes can be made.')

        current_status = now_application_identity.now_application.now_application_status_code
        if now_application_status_code is None or current_status == now_application_status_code:
            return 200

        # Handle approved status
        if now_application_status_code == 'AIA':
            permit = Permit.find_by_now_application_guid(application_guid)
            if not permit:
                raise NotFound('No permit found for this application.')

            permit_amendment = PermitAmendment.find_by_now_application_guid(application_guid)
            if not permit_amendment:
                raise NotFound('No permit amendment found for this application.')

            # Validate the application contacts and the issue date
            for contact in now_application_identity.now_application.contacts:
                if contact.mine_party_appt_type_code != 'PMT' and contact.mine_party_appt_type_code != 'MMG':
                    continue

                # A mine can only have one active mine manager and a permit can only have one active permittee
                current_apt = MinePartyAppointment.find_current_appointments(
                    permit_id=permit.permit_id
                    if contact.mine_party_appt_type_code == 'PMT' else None,
                    mine_guid=now_application_identity.mine.mine_guid
                    if contact.mine_party_appt_type_code == 'MMG' else None,
                    mine_party_appt_type_code=contact.mine_party_appt_type_code)
                if len(current_apt) > 1:
                    raise BadRequest(
                        'This mine has more than one mine manager. Resolve this and try again.'
                        if contact.mine_party_appt_type_code == 'MMG' else
                        'This permit has more than one permittee. Resolve this and try again.')

                # Validate that the issue date is not before the most recent amendment's issue date
                amendments = [
                    amendment for amendment in permit.permit_amendments
                    if amendment and amendment.issue_date
                ]
                if amendments:
                    latest_amendment = max(amendments, key=attrgetter('issue_date'))
                    if latest_amendment and latest_amendment.issue_date > issue_date.date():
                        raise BadRequest(
                            f'Cannot set the issue date of permit {permit.permit_no} before the issue date of its most recent amendment, dated {latest_amendment.issue_date}.'
                        )

                # Validate that the issue date is not before the appointment's start date
                if len(current_apt) == 1 and current_apt[0].start_date > issue_date.date():
                    raise BadRequest(
                        f'Cannot set the issue date prior to the start date of {current_apt[0].start_date}.'
                    )

            # Move the permit out of draft (draft status on permit indicates that the permit amendment is the first/original)
            if permit.permit_status_code == 'D':
                permit.permit_status_code = 'O'
                permit_amendment.permit_amendment_status_code = 'ACT'
                permit_amendment.permit_amendment_type_code = 'OGP'

            if permit_amendment.permit_amendment_status_code == 'DFT':
                permit_amendment.permit_amendment_status_code = 'ACT'

            if permit_amendment.permit_amendment_status_code != 'ACT':
                raise AssertionError('The permit status was not set to Active.')

            permit.save()

            permit_amendment.issue_date = issue_date
            permit_amendment.authorization_end_date = auth_end_date
            permit_amendment.description = description

            # Transfer reclamation security data from the application to the permit
            permit_amendment.liability_adjustment = now_application_identity.now_application.liability_adjustment
            permit_amendment.security_received_date = now_application_identity.now_application.security_received_date
            permit_amendment.security_not_required = now_application_identity.now_application.security_not_required
            permit_amendment.security_not_required_reason = now_application_identity.now_application.security_not_required_reason
            permit_amendment.save()

            # End all Tenure Holder, Land Owner, and Mine Operator appointments that are not present on current assignments and are linked to this permit
            only_one_contact_of_type_allowed = ['PMT', 'MMG']
            multiple_contact_type_allowed = ['THD', 'LDO', 'MOR']
            mine_party_appointments = MinePartyAppointment.find_current_appointments(
                mine_party_appt_type_code=multiple_contact_type_allowed, permit_id=permit.permit_id)
            filtered_contacts = [
                c for c in now_application_identity.now_application.contacts
                if c.mine_party_appt_type_code in multiple_contact_type_allowed
            ]
            for apt in mine_party_appointments:
                if apt.permit_id and not next(
                    (contact
                     for contact in filtered_contacts if contact.party_guid == apt.party_guid),
                        None):
                    apt.end_date = permit_amendment.issue_date - timedelta(days=1)
                    db.session.add(apt)
            db.session.commit()

            # Create contacts
            user_info = self.get_user_info()
            for contact in now_application_identity.now_application.contacts:
                if contact.mine_party_appt_type_code in ['PMT', 'MMG', 'THD', 'LDO', 'MOR']:
                    new_appt_needed = False
                    current_apt = MinePartyAppointment.find_current_appointments(
                        permit_id=permit.permit_id if contact.mine_party_appt_type_code
                        in PERMIT_LINKED_CONTACT_TYPES else None,
                        mine_guid=now_application_identity.mine.mine_guid
                        if contact.mine_party_appt_type_code == 'MMG' else None,
                        mine_party_appt_type_code=contact.mine_party_appt_type_code)

                    # A mine can only have one active Mine Manager and a permit can only have one active Permittee
                    if contact.mine_party_appt_type_code in only_one_contact_of_type_allowed:
                        if len(current_apt) > 1:
                            raise BadRequest(
                                'This mine has more than one mine manager. Resolve this and try again.'
                                if contact.mine_party_appt_type_code == 'MMG' else
                                'This permit has more than one permittee. Resolve this and try again.'
                            )

                        # If there is a current appointment and it does not match the proposed appointment, end the current and create a new one
                        if len(current_apt
                               ) == 1 and current_apt[0].party_guid != contact.party_guid:
                            new_appt_needed = True
                            current_apt[0].end_date = permit_amendment.issue_date - timedelta(
                                days=1)
                            db.session.add_all(current_apt)
                    else:
                        new_appt_needed = False if len(mine_party_appointments) > 0 and next(
                            (apt for apt in mine_party_appointments
                             if apt.party_guid == contact.party_guid), None) else True

                    # If there is no current appointment, create a new one
                    if len(current_apt) == 0:
                        new_appt_needed = True

                    # Create the new appointment, if necessary
                    if new_appt_needed:
                        new_mpa = MinePartyAppointment.create(
                            mine=now_application_identity.mine
                            if contact.mine_party_appt_type_code == 'MMG' else None,
                            permit=permit if contact.mine_party_appt_type_code
                            in PERMIT_LINKED_CONTACT_TYPES else None,
                            party_guid=contact.party_guid,
                            mine_party_appt_type_code=contact.mine_party_appt_type_code,
                            start_date=permit_amendment.issue_date,
                            end_date=None,
                            processed_by=user_info)
                        db.session.add(new_mpa)

            db.session.commit()

            # Issue verifiable credential to OrgBook (currently, a non-blocking operation)
            try:
                OrgBookIssuerService().issue_permit_amendment_vc(permit_amendment)
            except AssertionError as e:
                current_app.logger.info('VC not issued due to unsuccessful status code')
                current_app.logger.debug(str(e))
            except Exception as ex:
                current_app.logger.warning('VC not issued due to unknown error')
                current_app.logger.info(str(ex))

        # Handle rejected status
        elif now_application_status_code == 'REJ':
            for progress in now_application_identity.now_application.application_progress:
                progress.end_date = datetime.now(tz=timezone.utc)
            for delay in now_application_identity.application_delays:
                delay.end_date = datetime.now(tz=timezone.utc)

        # Update the status code
        now_application_identity.now_application.status_updated_date = datetime.utcnow()
        now_application_identity.now_application.previous_application_status_code = current_status
        now_application_identity.now_application.now_application_status_code = now_application_status_code
        now_application_identity.now_application.status_reason = status_reason

        now_application_identity.save()
        return 200

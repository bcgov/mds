from flask_restplus import Resource, inputs
from flask import request, current_app
from sqlalchemy_filters import apply_pagination, apply_sort
from sqlalchemy import desc, func, or_, and_
from werkzeug.exceptions import BadRequest
from datetime import datetime, timezone

from app.extensions import api, db
from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.now_party_appointment import NOWPartyAppointment
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from app.api.now_applications.models.administrative_amendments.amendment_reason_xref import AmendmentReasonXref
from app.api.now_applications.response_models import NOW_APPLICATION_MODEL
from app.api.utils.access_decorators import requires_role_edit_permit, requires_any_of, VIEW_ALL, GIS
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser


def map_notice_of_work_type_from_permit_number(permit_number):
    first_charecter = permit_number[0]
    return {'P': 'PLA', 'G': 'SAG', 'M': 'MIN', 'C': 'COL', 'Q': 'QCA'}.get(first_charecter, None)


class AdministrativeAmendmentListResource(Resource, UserMixin):
    parser = CustomReqparser()
    #required because only allowed on Major Mine Permit Amendment Application
    parser.add_argument('mine_guid', type=str, required=True)
    parser.add_argument('received_date', type=str, required=True)
    parser.add_argument('permit_amendment_guid', type=str, required=True)
    parser.add_argument('permit_id', type=int, required=True)
    parser.add_argument('amendment_reason_codes', type=list, location='json', required=True)

    @api.doc(description='Adds a Notice of Work to a mine/permit.', params={})
    # @requires_role_edit_permit
    @api.marshal_with(NOW_APPLICATION_MODEL, code=201)
    def post(self):
        data = self.parser.parse_args()
        current_app.logger.debug("this is administrative amendment post endpoint")

        # proposed start source issue date
        # proposed end and end date

        mine = Mine.find_by_mine_guid(data['mine_guid'])
        permit = Permit.find_by_permit_id(data['permit_id'])
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(
            data['permit_amendment_guid'])

        application = None
        if permit_amendment.now_application_guid:
            application = NOWApplication.find_by_application_guid(
                permit_amendment.now_application_guid)

        err_str = ''
        if not mine:
            err_str += 'Mine not found. '
        if not permit:
            err_str += 'Permit not found. '
        if not permit_amendment:
            err_str += "Permit amendment not found"
        if err_str:
            raise BadRequest(err_str)

        # create a now_application_identity
        # create a application (copy all contacts, documents, conditions from original amendment)
        # copy permit conditions and if not present then copy standart conditions
        data = self.parser.parse_args()

        try:
            # get NOW_type_code
            notice_of_work_type_code = None
            if application:
                notice_of_work_type_code = application.notice_of_work_type_code
            else:
                notice_of_work_type_code = map_notice_of_work_type_from_permit_number(
                    permit.permit_no)

            # create a now_application_identity
            # create an application

            new_app = NOWApplicationIdentity(
                mine_guid=data['mine_guid'],
                permit=permit,
                permit_id=permit.permit_id,
                now_number=NOWApplicationIdentity.create_now_number(mine),
                application_type_code='ADA')
            new_app.now_application = NOWApplication(
                notice_of_work_type_code=notice_of_work_type_code,
                now_application_status_code='REC',
                submitted_date=data['received_date'],
                received_date=data['received_date'],
                proposed_start_date=permit_amendment.issue_date,
                proposed_end_date=permit_amendment.authorization_end_date)
            new_app.originating_system = 'Core'

            db.session.add(new_app)

            # copy contacts
            if permit.permittee_appointments:
                application_appt = []
                # TODO clarify
                # this will cope all permittees, even the ones for this permit
                for mine_appt in [
                        party for party in permit.permittee_appointments if not party.end_date
                        or party.end_date >= datetime.now(timezone.utc).date()
                ]:
                    new_app_appt = NOWPartyAppointment(
                        mine_party_appt_type_code=mine_appt.mine_party_appt_type_code,
                        now_application_id=new_app.now_application_id,
                        party_guid=mine_appt.party_guid)

                    db.session.add(new_app_appt)
                    application_appt.append(new_app_appt)
                new_app.contacts = application_appt

            def get_documents_to_attach(db, documents, is_document_type_present):
                res_documents = []
                for doc in [doc for doc in documents if doc.is_final_package]:
                    mine_doc = MineDocument(
                        document_name=doc.mine_document.document_name,
                        document_manager_guid=doc.mine_document.document_manager_guid,
                        mine_guid=mine.mine_guid)
                    db.session.add(mine_doc)

                    new_appt_doc = NOWApplicationDocumentXref(
                        mine_document=mine_doc,
                        now_application_id=new_app.now_application_id,
                        is_final_package=doc.is_final_package,
                        preamble_title=doc.preamble_title,
                        preamble_author=doc.preamble_author,
                        preamble_date=doc.preamble_date,
                        mine_document_guid=doc.mine_document_guid,
                        description=doc.description)

                    if is_document_type_present:
                        new_appt_doc.now_application_document_type_code = doc.now_application_document_type_code

                    db.session.add(new_appt_doc)

                    res_documents.append(doc)
                return res_documents

            if application:
                documents_to_copy = []

                if application.documents:
                    documents_to_copy.append(
                        get_documents_to_attach(db, application.documents, True))

                if application.imported_submission_documents:
                    documents_to_copy.append(
                        get_documents_to_attach(db, application.imported_submission_documents,
                                                False))

                new_app.documents = documents_to_copy

            for reason in data['amendment_reason_codes']:
                app_reason = AmendmentReasonXref(
                    now_application_guid=new_app.now_application_guid, amendment_reason_code=reason)
                db.session.add(app_reason)

            db.session.add(new_app)
            db.session.commit()
        except:
            db.session.rollback()
            raise

        return new_app, 201

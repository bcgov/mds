from flask_restplus import Resource, inputs
from flask import request, current_app
from sqlalchemy_filters import apply_pagination, apply_sort
from sqlalchemy import desc, func, or_, and_
from werkzeug.exceptions import BadRequest
from datetime import datetime

from app.extensions import api, db
from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
# from app.api.administrative_amendments.models.administrative_amendment_view import AdministrativeAmendmentView
from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.now_party_appointment import NOWPartyAppointment
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from app.api.now_applications.models.administrative_amendments.amendment_reason_xref import ApplicationTriggerXref
# from app.api.administrative_amendments.response_models import ADMINISTRATIVE_AMENDMENT_VIEW_LIST
from app.api.now_applications.response_models import NOW_APPLICATION_MODEL
from app.api.utils.access_decorators import requires_role_edit_permit, requires_any_of, VIEW_ALL, GIS
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser


class AdministrativeAmendmentListResource(Resource, UserMixin):
    parser = CustomReqparser()
    #required because only allowed on Major Mine Permit Amendment Application
    parser.add_argument('mine_guid', type=str, required=True)
    parser.add_argument('notice_of_work_type_code', type=str, required=True)
    parser.add_argument('received_date', type=str, required=True)
    parser.add_argument('permit_amendment_guid', type=str, required=True)
    parser.add_argument('permit_id', type=int, required=True)
    parser.add_argument('application_triggers', type=list, location='json', required=True)

    @api.doc(description='Adds a Notice of Work to a mine/permit.', params={})
    # @requires_role_edit_permit
    @api.marshal_with(NOW_APPLICATION_MODEL, code=201)
    def post(self):
        data = self.parser.parse_args()
        current_app.logger.debug("this is administrative amendment post endpoint")

        mine = Mine.find_by_mine_guid(data['mine_guid'])
        permit = Permit.find_by_permit_id(data['permit_id'])
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(
            data['permit_amendment_guid'])

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

        # create draft amendment and copy everything from amendment in parameters to the draft amendment

        # create a progress record if everything ran successfully

        data = self.parser.parse_args()

        try:
            # create a now_application_identity
            # create an application
            new_app = NOWApplicationIdentity(
                mine_guid=data['mine_guid'],
                permit=permit,
                permit_id=permit.permit_id,
                application_type_code='ADA')
            new_app.now_application = NOWApplication(
                notice_of_work_type_code=data['notice_of_work_type_code'],
                now_application_status_code='REC',
                submitted_date=data['received_date'],
                received_date=data['received_date'])
            new_app.originating_system = 'Core'

            db.session.add(new_app)

            for trigger in data['application_triggers']:
                app_trigger = ApplicationTriggerXref(
                    now_application_guid=new_app.now_application_guid,
                    amendment_reason_code=trigger)
                db.session.add(app_trigger)

            # copy contacts

            if permit.permittee_appointments:
                application_appt = []
                for mine_appt in permit.permittee_appointments:
                    new_app_appt = NOWPartyAppointment(
                        mine_party_appt_type_code=mine_appt.mine_party_appt_type_code,
                        now_application_id=new_app.now_application_id,
                        party_guid=mine_appt.party_guid)

                    db.session.add(new_app_appt)
                    application_appt.append(new_app_appt)
                new_app.contacts = application_appt

            db.session.add(new_app)
            db.session.commit()
        except:
            db.session.rollback()
            raise

        return new_app, 201

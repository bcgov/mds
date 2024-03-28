import uuid
from flask_restx import Resource
from werkzeug.exceptions import BadRequest, NotFound
from datetime import datetime, timezone

from app.extensions import api, db
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, EDIT_REPORT, MINESPACE_PROPONENT
from app import auth

from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_submission import MineReportSubmission
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.reports.models.mine_report_contact import MineReportContact
from app.api.mines.permits.permit_conditions.models.permit_condition_category import PermitConditionCategory
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.mine.models.mine import Mine
from app.api.mines.documents.models.mine_document import MineDocument

from app.api.utils.custom_reqparser import CustomReqparser
from app.api.mines.response_models import MINE_REPORT_SUBMISSION_MODEL
class ReportSubmissionResource(Resource, UserMixin):

    parser = CustomReqparser()

    @staticmethod
    def get_mine_report_submission_contacts(contact_data, mine_report_id, mine_report_submission_id):
        mine_report_contacts = []
        if contact_data is not None and len(contact_data) > 0:
            mine_report_contacts = MineReportContact.create_from_list(contact_data, mine_report_id, mine_report_submission_id)
        return mine_report_contacts
            
    @staticmethod 
    def get_check_mine_report_definition_id(mine_report_definition_guid):
        mine_report_definition = MineReportDefinition.find_by_mine_report_definition_guid(
            mine_report_definition_guid)
        if mine_report_definition is None:
            raise BadRequest('A code required report type must be selected from the list.')
        return mine_report_definition.mine_report_definition_id

    @staticmethod
    def get_check_permit_id(permit_condition_category_code, permit_guid, mine_guid):
        permit_condition_category = PermitConditionCategory.find_by_permit_condition_category_code(
            permit_condition_category_code)
        if not permit_condition_category:
            raise BadRequest('A permit required report type must be selected from the list.')
        permit_error_message = 'A permit must be selected for Permit Required Report'
        if not permit_guid:
            raise BadRequest(permit_error_message)
        permit = Permit.find_by_permit_guid_or_no(permit_guid)
        if not permit:
            raise BadRequest(permit_error_message)
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise NotFound('Mine not found')
        permit._context_mine = mine
        if mine.mine_guid != permit.mine.mine_guid:
            raise BadRequest('The permit must be associated with the selected mine.')
        return permit.permit_id

    @staticmethod
    def get_updated_documents(documents, is_proponent, mine_guid):
        report_documents = []
        for doc in documents:
            mine_document_guid = doc.get('mine_document_guid', None)
            if not mine_document_guid:
                report_doc = MineDocument(
                    mine_guid=mine_guid,
                    document_name=doc['document_name'],
                    document_manager_guid=doc['document_manager_guid'],
                )
                if not report_doc:
                    raise BadRequest(f'Unable to register uploaded file as document')
            else:
                # TODO: modify document if archiving/versioning, confirm what actions allowed in MS
                report_doc = MineDocument.find_by_mine_document_guid(mine_document_guid)
                if not report_doc:
                    raise BadRequest(f'Unable to find document with Mine document guid {mine_document_guid}')
            
            report_documents.append(report_doc)
        return report_documents
    
    @staticmethod
    def create_initial_mine_report(request_data, permit_id=None, mine_report_definition_id=None):
        mine_report = MineReport(
            mine_report_definition_id=mine_report_definition_id,
            mine_guid=request_data.get('mine_guid'),
            due_date=request_data.get('due_date'),
            received_date=request_data.get('received_date'),
            submission_year=request_data.get('submission_year'),
            description_comment=request_data.get('description_comment'),
            submitter_name=request_data.get('submitter_name'),
            permit_id=permit_id,
            permit_condition_category_code=request_data.get('permit_condition_category_code'),
            submitter_email=request_data.get('submitter_email'),
        )
        mine_report.save()
        return mine_report
    
    # case when report has been requested
    @staticmethod
    def create_initial_submission_from_minespace(request_data, report_documents):
        mine_report = MineReport.find_by_mine_report_guid(request_data.get('mine_report_guid'))
        mine_report_id = getattr(mine_report, "mine_report_id")

        report_submission = MineReportSubmission(
            create_timestamp=getattr(mine_report, "create_timestamp"),
            description_comment=request_data.get("description_comment", None),
            due_date=getattr(mine_report, "due_date"),
            documents=report_documents,
            mine_guid=getattr(mine_report, "mine_guid"),
            mine_report_definition_id=getattr(mine_report, "mine_report_definition_id"),
            mine_report_id=mine_report_id,
            mine_report_submission_status_code="INI",
            permit_condition_category_code=getattr(mine_report, "permit_condition_category_code"),
            permit_id=getattr(mine_report, "permit_id"),
            received_date=request_data.get("received_date", None),
            submission_date=datetime.utcnow(),
            submission_year=getattr(mine_report, "submission_year"),
            submitter_email=request_data.get("submitter_email", None),
            submitter_name=request_data.get("submitter_name", None),
        )        
        mine_report_contacts = ReportSubmissionResource.get_mine_report_submission_contacts(
            request_data.get('mine_report_contacts'), mine_report_id, report_submission.mine_report_submission_id)
        report_submission.mine_report_contacts = mine_report_contacts
        report_submission.save()
        return report_submission

    # not for first submission, for subsequent
    @staticmethod
    def create_submission_from_minespace(mine_report_guid, request_data, report_documents):
        previous_submission = MineReportSubmission.find_latest_by_mine_report_guid(str(mine_report_guid))
        if not previous_submission or request_data.get('mine_report_submission_status_code') == "NON":
            return ReportSubmissionResource.create_initial_submission_from_minespace(request_data, report_documents)
        mine_report_submission_status_code = "NRQ"

        report_submission = MineReportSubmission(
            create_timestamp=getattr(previous_submission, "create_timestamp"),
            create_user=getattr(previous_submission, "create_user"),
            description_comment=getattr(previous_submission, "description_comment"),
            due_date=getattr(previous_submission, "due_date"),
            documents=report_documents,
            mine_guid=getattr(previous_submission, "mine_guid"),
            mine_report_contacts=getattr(previous_submission, "mine_report_contacts"),
            mine_report_definition_id=getattr(previous_submission, "mine_report_definition_id"),
            mine_report_id=getattr(previous_submission, "mine_report_id"),
            mine_report_submission_status_code=mine_report_submission_status_code,
            permit_condition_category_code=getattr(previous_submission, "permit_condition_category_code"),
            permit_id=getattr(previous_submission, "permit_id"),
            received_date=getattr(previous_submission, "received_date"),
            submission_date=datetime.now(timezone.utc),
            submission_year=getattr(previous_submission, "submission_year"),
            submitter_email=getattr(previous_submission, "submitter_email"),
            submitter_name=getattr(previous_submission, "submitter_name"),
        )
        
        report_submission.save()
        previous_submission.is_latest = False
        previous_submission.save()
        return report_submission

    @api.expect(parser)
    @api.doc(description="Create a new mine report submission")    
    @api.marshal_with(MINE_REPORT_SUBMISSION_MODEL, code=201)
    @requires_any_of([EDIT_REPORT, MINESPACE_PROPONENT])
    def post(self):
        self.parser.add_argument('documents', type=list, location='json')
        self.parser.add_argument('description_comment', type=str, location='json')        
        self.parser.add_argument(
            'due_date',
            type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
            location='json'
            )
        self.parser.add_argument('mine_guid', type=str, location='json')
        self.parser.add_argument('mine_report_contacts', type=list, location='json')
        self.parser.add_argument('mine_report_definition_guid', type=str, location='json')
        self.parser.add_argument('mine_report_id', type=str, location='json')
        self.parser.add_argument('mine_report_guid', type=str, location='json')
        self.parser.add_argument('mine_report_submission_guid', type=str, location='json')
        self.parser.add_argument('mine_report_submission_status_code', type=str, location='json')
        self.parser.add_argument('permit_condition_category_code', type=str, location='json')
        self.parser.add_argument('permit_guid', type=str, location='json')
        self.parser.add_argument(
            'received_date', 
            type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None, 
            location='json'
            )
        self.parser.add_argument('submission_date', type=str, location='json')
        self.parser.add_argument('submission_year', type=str, location='json')
        self.parser.add_argument('submitter_email', type=str, location='json')
        self.parser.add_argument('submitter_name', type=str, location='json')
        self.parser.add_argument('report_type', type=str, location='json')

        data = self.parser.parse_args()
        is_proponent = auth.get_user_is_proponent()

        mine_guid = data.get('mine_guid', None)
        mine_report_guid = data.get('mine_report_guid', None)
        mine_report_submission_guid = data.get('mine_report_submission_guid', None)
        mine_report_id = data.get('mine_report_id', None)
        permit_condition_category_code = data.get('permit_condition_category_code', None)
        documents = data.get('documents', [])
        mine_report_definition_guid = data.get('mine_report_definition_guid', None)
        permit_guid = data.get('permit_guid', None)
        mine_report_submission_status_code = data.get('mine_report_submission_status_code', None)
        contacts = data.get('mine_report_contacts', [])
        report_type = data.get('report_type', None)

        if not mine_report_submission_status_code or is_proponent:
            mine_report_submission_status_code = "INI"

        is_code_required_report = permit_condition_category_code == None
        mine_report_definition_id = None
        permit_id = None

        create_initial_report = False if mine_report_guid else True
        is_first_submission = False if mine_report_submission_guid else True    
        if is_code_required_report:
            mine_report_definition_id = self.get_check_mine_report_definition_id(mine_report_definition_guid)
        else:
            permit_id = self.get_check_permit_id(permit_condition_category_code, permit_guid, mine_guid)

        report_documents = ReportSubmissionResource.get_updated_documents(documents, is_proponent, mine_guid)        
        
        if create_initial_report:
            mine_report = self.create_initial_mine_report(data, permit_id, mine_report_definition_id)
            mine_report_guid = mine_report.mine_report_guid
            mine_report_id = mine_report.mine_report_id
        
        # MS user only allowed to add documents unless new report has been requested
        if is_proponent and not create_initial_report:
            return self.create_submission_from_minespace(mine_report_guid, data, report_documents)
        
        create_timestamp = None
        create_user = None
        previous_submission = None
        if not is_proponent and not is_first_submission:
            previous_submission = MineReportSubmission.find_latest_by_mine_report_guid(str(mine_report_guid))
            create_timestamp = getattr(previous_submission, 'create_timestamp')
            create_user = getattr(previous_submission, 'create_user')

        report_submission = MineReportSubmission(
            create_timestamp=create_timestamp,
            create_user=create_user,
            description_comment=data.get('description_comment', None),
            due_date=data.get('due_date', None),
            documents=report_documents,
            mine_guid=mine_guid,
            mine_report_definition_id=mine_report_definition_id,
            mine_report_id=mine_report_id,
            mine_report_submission_status_code=mine_report_submission_status_code,
            permit_condition_category_code=permit_condition_category_code,
            permit_id=permit_id,
            received_date=data.get('received_date', None),
            submission_date=datetime.now(timezone.utc),
            submission_year=data.get('submission_year', None),
            submitter_email=data.get('submitter_email', None),
            submitter_name=data.get('submitter_name', None)
        )

        mine_report_contacts = self.get_mine_report_submission_contacts(
            contacts, mine_report_id, report_submission.mine_report_submission_id)
        report_submission.mine_report_contacts = mine_report_contacts

        report_submission.save()
        if previous_submission:
            previous_submission.is_latest = False
            previous_submission.save()

        if create_initial_report:
            mine_report.send_crr_and_prr_add_notification_email(is_proponent, report_type)

        return report_submission, 201
    
    @api.doc(params={
        "mine_report_guid": "Report guid for the parent entity",
        "latest_submission": "If true (default) only return the latest report submission"
    })
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(MINE_REPORT_SUBMISSION_MODEL, code=200)
    def get(self): 
        self.parser.add_argument(
            'mine_report_guid',
            type=str,
            required=False,
            store_missing=False
        )
        self.parser.add_argument(
            'latest_submission',
            type=bool,
            required=False,
            store_missing=False
        )       

        data = self.parser.parse_args()
        mine_report_guid = data.get('mine_report_guid', None)
        latest_submission = data.get('latest_submission', None)

        if mine_report_guid is None:
            # TODO: not actually required per se, more like Not Implemented-
            # will want to be able to query a list of mine report submissions
            # from different mines and different reports
            raise BadRequest('Error: mine report guid is required')

        if (latest_submission == True):
            submission = MineReportSubmission.find_latest_by_mine_report_guid(mine_report_guid)
            if not submission: 
                report = MineReport.find_by_mine_report_guid(mine_report_guid)
                # different names for same property
                report.mine_report_submission_status_code = "NON"
                return report
            return submission

        return MineReportSubmission.find_by_mine_report_guid(mine_report_guid)

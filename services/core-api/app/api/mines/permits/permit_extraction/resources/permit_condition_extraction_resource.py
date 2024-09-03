from flask_restx import Resource, inputs, reqparse
from werkzeug.exceptions import BadRequest
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask import current_app
from app.api.search.search.permit_search_service import PermitSearchService
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import (
    PermitAmendmentDocument,
)
from app.config import Config
from app.api.utils.access_decorators import requires_role_edit_standard_permit_conditions, requires_any_of, VIEW_ALL, MINESPACE_PROPONENT

class PermitConditionExtractionResource(Resource, UserMixin):

    @requires_role_edit_standard_permit_conditions
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument(
            'permit_amendment_id',
            type=str,
            location='json',
            required=True,
            help='Permit amendment id to perform condition extraction'
        )
        parser.add_argument(
            'permit_amendment_document_guid',
            type=str,
            location='json',
            required=True,
            help='Reference to the PDF document to extract conditions from'
        )

        args = parser.parse_args()
        permit_amendment_id = args.get('permit_amendment_id')
        permit_amendment_document_guid = args.get('permit_amendment_document_guid')
        
        amendment_document = PermitAmendmentDocument.find_by_permit_amendment_document_guid(permit_amendment_document_guid)

        if not amendment_document:
            raise BadRequest('Permit document not found')
        if str(amendment_document.permit_amendment_id) != str(permit_amendment_id):
            raise BadRequest('Permit document must be associated with the permit amendment')
        
        result = None
        app = current_app._get_current_object()
        with app.app_context():
        #     result = PermitSearchService().initialize_permit_extraction(amendment_document.document_manager_guid)
        return result


    @requires_any_of([VIEW_ALL])
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument()
        # get results of extraction

class PermitConditionExtractionProgressResource(Resource, UserMixin):
    api.doc('Returns the status of the permit extraction task')

    @requires_any_of([VIEW_ALL])
    def get(self, task_id):
        if not task_id:
            raise BadRequest('No task id provided')
        # call the poll
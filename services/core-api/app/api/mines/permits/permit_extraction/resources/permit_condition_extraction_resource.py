from app.api.mines.permits.permit_amendment.models.permit_amendment import (
    PermitAmendment,
)
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import (
    PermitAmendmentDocument,
)
from app.api.mines.permits.permit_conditions.models.permit_conditions import (
    PermitConditions,
)
from app.api.mines.permits.permit_extraction.models.permit_extraction_task import (
    PermitExtractionTask,
)
from app.api.mines.permits.permit_extraction.models.response_model import (
    PERMIT_CONDITION_EXTRACTION_TASK,
)
from app.api.mines.permits.permit_extraction.tasks import (
    poll_update_permit_extraction_status,
)
from app.api.search.search.permit_search_service import PermitSearchService
from app.api.utils.access_decorators import (
    VIEW_ALL,
    requires_any_of,
    requires_role_edit_standard_permit_conditions,
)
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest


class PermitConditionExtractionResource(Resource, UserMixin):

    @requires_role_edit_standard_permit_conditions
    @api.doc(description='Trigger the extraction of conditions from a permit document')
    @api.marshal_with(PERMIT_CONDITION_EXTRACTION_TASK, code=200)
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
        
        permit_amendment = PermitAmendment.find_by_permit_amendment_id(permit_amendment_id)

        if len(permit_amendment.conditions) > 0:
            raise BadRequest('Permit conditions already exist for this permit amendment')

        task = PermitSearchService().initialize_permit_extraction(amendment_document)

        if task:
            core_task = poll_update_permit_extraction_status.delay(task.permit_extraction_task_id)

            task.core_status_task_id = core_task.id
            task.save()
        
        return task

    
    @api.doc(description='Get all permit extraction tasks for a permit amendment')
    @api.marshal_with(PERMIT_CONDITION_EXTRACTION_TASK, code=200, as_list=True, envelope='tasks')
    @requires_any_of([VIEW_ALL])
    def get(self):
        parser = reqparse.RequestParser()

        parser.add_argument(
            'permit_amendment_id',
            type=str,
            location='args',
            required=True,
            help='Permit amendment id to perform condition extraction'
        )
        args = parser.parse_args()

        amd = PermitAmendment.find_by_permit_amendment_id(args.get('permit_amendment_id'))

        if not amd:
            raise BadRequest('Permit amendment not found')

        tasks = PermitExtractionTask.get_by_permit_amendment_guid(amd.permit_amendment_guid)

        return tasks
    

    @api.doc(description='Delete all permit conditions associated with permit amendment')
    @requires_role_edit_standard_permit_conditions
    def delete(self):
        parser = reqparse.RequestParser()

        parser.add_argument(
            'permit_amendment_id',
            type=str,
            location='args',
            required=True,
            help='Permit amendment id to perform condition extraction'
        )
        args = parser.parse_args()

        PermitConditions.delete_all_by_permit_amendment_id(args['permit_amendment_id'], commit=True)


class PermitConditionExtractionProgressResource(Resource, UserMixin):
    api.doc('Returns the status of the permit extraction task')

    @requires_any_of([VIEW_ALL])
    @api.marshal_with(PERMIT_CONDITION_EXTRACTION_TASK, code=200)
    @api.doc(description='Get the status of a permit extraction task')
    def get(self, task_id):
        if not task_id:
            raise BadRequest('No task id provided')
        
        task = PermitExtractionTask.get_by_permit_extraction_task_id(task_id).first()

        if not task:
            raise BadRequest('Task not found')

        return task

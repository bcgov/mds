import logging
import os
import tempfile
import uuid
from io import BytesIO

import requests
from app.api.mines.permits.permit.models.mine_permit_xref import MinePermitXref
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import (
    PermitAmendment,
)
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import (
    PermitAmendmentDocument,
)
from app.api.mines.permits.permit_extraction.models.permit_extraction_task import (
    PermitExtractionTask,
)
from app.api.services.document_manager_service import DocumentManagerService
from app.config import Config
from authlib.integrations.requests_client import OAuth2Session
from flask import current_app
from werkzeug.exceptions import InternalServerError

JWT_OIDC_WELL_KNOWN_CONFIG = os.getenv('JWT_OIDC_WELL_KNOWN_CONFIG')

oidc_configuration = requests.get(JWT_OIDC_WELL_KNOWN_CONFIG).json()
SEARCH_ENDPOINT = f'{Config.PERMITS_ENDPOINT}/permit/query'
EXTRACTION_ENDPOINT = f'{Config.PERMITS_ENDPOINT}/permit_conditions'
EXTRACTION_STATUS_ENDPOINT = f'{Config.PERMITS_ENDPOINT}/permit_conditions/status'
EXTRACTION_RESULTS_ENDPOINT = f'{Config.PERMITS_ENDPOINT}/permit_conditions/results'


class PermitSearchService:

    def __init__(self):
        self.session = OAuth2Session(client_id=Config.PERMITS_CLIENT_ID, client_secret=Config.PERMITS_CLIENT_SECRET, token_endpoint=oidc_configuration['token_endpoint'], grant_type='client_credentials')
        self.session.fetch_token()
        

    def search(self, search_term):
        """
        Performs a search against the permit service by the `search_term`.
        """
        results = self.session.post(SEARCH_ENDPOINT, json={'query': search_term,'debug': False, 'params': {}}).json()
        return results['documents']

    def initialize_permit_extraction(self, permit_amendment_document):
        """
        Begins the process of extracting permit conditions from a the PDF document.

        1. Download the given document from Docman into a temporary file.
        2. Trigger the extraction process by sending the file to the permit conditions service.
        3. Create a new task to track the status of the extraction process.
        """
        document_manager_guid = permit_amendment_document.document_manager_guid

        current_app.logger.info(f'Initiating permit extraction for document {document_manager_guid}')

        with tempfile.NamedTemporaryFile() as file:
            file_name, fle = DocumentManagerService().download_document_to_file(document_manager_guid, file)
            fle.seek(0)

            try:
                files = {'file': (file_name or 'permit.pdf', fle, 'application/pdf')}
                result = self.session.post(EXTRACTION_ENDPOINT, files=files)
                
                if result.status_code != 200:
                    current_app.logger.error(f'Failed to extract permit conditions for document {document_manager_guid}. Status code: {result.status_code}. Response: {result.text}')
                    raise InternalServerError('Failed to extract permit conditions. Could not download document')
                data = result.json()
                task = PermitExtractionTask.create(
                    permit_extraction_task_id=uuid.uuid4(),
                    task_id=data['id'],
                    task_status=data['status'],
                    permit_amendment_guid=permit_amendment_document.permit_amendment.permit_amendment_guid,
                    permit_amendment_document_guid=permit_amendment_document.permit_amendment_document_guid,
                    task_meta=data['meta']
                )
                return task                
            except Exception as e:
                current_app.logger.error(f'Failed to extract permit conditions for document {document_manager_guid}. Error: {str(e)}')
                raise e

    def update_task_status(self, permit_extraction_task_id):
        """
        Updates the status of the given permit extraction task, with the latest information from the permit conditions service.
        
        If the task is successful, retrieves the results of the extraction process and saves them to the task.
        """
        task = PermitExtractionTask.query.filter_by(permit_extraction_task_id=permit_extraction_task_id).first()

        if not task:
            raise InternalServerError('Task not found')
        
        result = self.session.get(f'{EXTRACTION_STATUS_ENDPOINT}?task_id={task.task_id}')

        if result.status_code != 200:
            current_app.logger.error(f'Failed to retrieve status of task from PermitService: {task.task_id}, status code: {result.status_code}. Response: {result.text}')
            raise InternalServerError('Could not retrieve status of task')

        data = result.json()

        if task.task_status != data['status']:
            current_app.logger.info(f'Updating permit condition extract task status for task {task.task_id} from {task.task_status} to {data["status"]}')

        task.task_status = data['status']
        task.meta = data['meta']

        if data['status'] == 'SUCCESS':
            results_response = self.session.get(f'{EXTRACTION_RESULTS_ENDPOINT}?task_id={task.task_id}')

            if results_response.status_code != 200:
                current_app.logger.error(f'Failed to retrieve the result of task from PermitService: {task.task_id}, status code: {result.status_code}. Response: {result.text}')
                raise InternalServerError('Something went wrong')
            
            data = results_response.json()

            task.task_result = data

        task.save()
        return task

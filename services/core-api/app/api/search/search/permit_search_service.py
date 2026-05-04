import json
import os
import tempfile
import uuid

import requests
from app.api.mines.permits.permit_extraction.models.permit_extraction_task import (
    PermitExtractionTask,
)
from app.api.services.document_manager_service import DocumentManagerService
from app.config import Config
from authlib.integrations.requests_client import OAuth2Session
from flask import current_app
from werkzeug.exceptions import InternalServerError


class PermitSearchService:
    _oidc_configuration = None

    @property
    def oidc_configuration(self):
        if not self._oidc_configuration:
            well_known_config = os.getenv('JWT_OIDC_WELL_KNOWN_CONFIG')
            self._oidc_configuration = requests.get(well_known_config).json()
        return self._oidc_configuration

    @property
    def session(self):
        if not hasattr(self, '_session'):
            self._session = OAuth2Session(
                client_id=Config.PERMITS_CLIENT_ID,
                client_secret=Config.PERMITS_CLIENT_SECRET,
                token_endpoint=self.oidc_configuration['token_endpoint'],
                grant_type='client_credentials')
            self._session.fetch_token()
        return self._session

    @property
    def search_endpoint(self):
        return f'{Config.PERMITS_ENDPOINT}/permit_conditions/search'

    @property
    def extraction_endpoint(self):
        return f'{Config.PERMITS_ENDPOINT}/permit_conditions'

    @property
    def extraction_status_endpoint(self):
        return f'{Config.PERMITS_ENDPOINT}/permit_conditions/status'

    @property
    def extraction_results_endpoint(self):
        return f'{Config.PERMITS_ENDPOINT}/permit_conditions/results'

    def search(self, search_term):
        """
        Performs a streaming search against the permit service by the `search_term`.
        Returns a generator that yields SSE formatted responses.
        """
        print(f'Searching for permit conditions with term: {search_term}')
        response = self.session.post(
            self.search_endpoint,
            data=json.dumps({'query': search_term['query'], 'filters': search_term.get('filters')}),
            stream=True,
        )
        
        # Just return the response directly for streaming
        return response
    
    def blob_upload(self, file, filename="filename.csv"):
        """
        Sends a file to the permit conditions service to be uploaded for indexing.
        """
        print(f'Uploading file {filename}')
        result = self.session.post(
            self.search_endpoint+"/upload",
            files={"file": (filename, file, 'text/csv')},
        )
        if result.status_code != 200:
            current_app.logger.error(f'Failed to index file. Status code: {result.status_code}. Response: {result.text}')
            raise InternalServerError('Failed to index file')

    def initialize_permit_extraction(self, permit_amendment_document, with_internal_auth=False):
        """
        Begins the process of extracting permit conditions from a the PDF document.

        1. Download the given document from Docman into a temporary file.
        2. Trigger the extraction process by sending the file to the permit conditions service.
        3. Create a new task to track the status of the extraction process.
        """
        document_manager_guid = permit_amendment_document.document_manager_guid

        current_app.logger.info(f'Initiating permit extraction for document {document_manager_guid}')

        headers = None
        if with_internal_auth:
            token = self.session.fetch_token()
            headers = {'Authorization': f'Bearer {token["access_token"]}'}

        with tempfile.NamedTemporaryFile() as file:
            file_name, fle = DocumentManagerService().download_document_to_file(document_manager_guid, file, headers=headers)
            fle.seek(0)

            try:
                files = {'file': (file_name or 'permit.pdf', fle, 'application/pdf')}
                result = self.session.post(self.extraction_endpoint, files=files)
                
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

        result = self.session.get(f'{self.extraction_status_endpoint}?task_id={task.task_id}')

        if result.status_code != 200:
            current_app.logger.error(f'Failed to retrieve status of task from PermitService: {task.task_id}, status code: {result.status_code}. Response: {result.text}')
            raise InternalServerError('Could not retrieve status of task')

        data = result.json()

        if task.task_status != data['status']:
            current_app.logger.info(f'Updating permit condition extract task status for task {task.task_id} from {task.task_status} to {data["status"]}')

        task_status = data['status']
        task.meta = data['meta']

        if data['status'] == 'SUCCESS':
            results_response = self.session.get(f'{self.extraction_results_endpoint}?task_id={task.task_id}')

            if results_response.status_code != 200:
                current_app.logger.error(f'Failed to retrieve the result of task from PermitService: {task.task_id}, status code: {result.status_code}. Response: {result.text}')
                raise InternalServerError('Something went wrong')
            
            data = results_response.json()

            task.task_result = data

        return task, task_status

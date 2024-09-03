import requests
from authlib.integrations.requests_client import OAuth2Session
import os
from app.config import Config

from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
from app.api.mines.permits.permit_amendment.models.permit_amendment_document import (
    PermitAmendmentDocument,
)
from app.api.mines.permits.permit.models.mine_permit_xref import MinePermitXref
from app.api.mines.permits.permit.models.permit import Permit
from app.api.services.document_manager_service import DocumentManagerService

from flask import current_app
JWT_OIDC_WELL_KNOWN_CONFIG = os.getenv('JWT_OIDC_WELL_KNOWN_CONFIG')

oidc_configuration = requests.get(JWT_OIDC_WELL_KNOWN_CONFIG).json()
SEARCH_ENDPOINT = f'{Config.PERMITS_ENDPOINT}/permit/query'
EXTRACTION_ENDPOINT = f'{Config.PERMITS_ENDPOINT}/permit_conditions'
EXTRACTION_STATUS_ENDPOINT = f'{Config.PERMITS_ENDPOINT}/permit_conditions/status'
EXTRACTION__RESULTS_ENDPOINT = f'{Config.PERMITS_ENDPOINT}/permit_conditions/results'


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

    def initialize_permit_extraction(self, document_manager_guid):
        """
        Begins the process of extracting permit conditions from the PDF document
        """
        current_app.logger.info('initialize_permit_extraction!!!!!')
        document = DocumentManagerService().get_document_version()
        # document = PermitAmendmentDocument.find_by_permit_amendment_document_guid(permit_amendment_document_guid)

        # if not document:
        #     raise BadRequest('Permit document not found')
        # if document.permit_amendment.permit_amendment_guid != permit_amendment_guid:
        #     raise BadRequest('Permit document must be associated with the permit amendment')
        current_app.logger.info(document)
        try:
            current_app.logger.info('HI TARA FROM START TRY')
            file_path = ""
            with open(file_path, 'rb') as document_data:
                multipart_data = MultipartEncoder(
                    fields={
                        'file': (os.path.basename(file_path), file, mime_type)
                    }
                )
                headers = {
                    'Content-Type': multipart_data.content_type
                }
            current_app.logger.info('HI TARA FROM END TRY')
            results = self.session.post(EXTRACTION_ENDPOINT, data=multipart_data, headers=headers).json()
            return results
        except:
            raise Exception('Something went wrong')

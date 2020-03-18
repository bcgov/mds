import requests, base64
from tusclient import client

from flask import Response, current_app
from app.config import Config

ALLOWED_DOCUMENT_CATEGORIES = [
    'tailings', 'permits', 'variances', 'incidents', 'reports', 'mine_party_appts', 'noticeofwork'
]


class DocumentManagerService():
    document_manager_url = f'{Config.DOCUMENT_MANAGER_URL}/documents'

    @classmethod
    def initializeFileUploadWithDocumentManager(cls, request, mine, document_category):
        metadata = cls._parse_request_metadata(request)
        if not metadata or not metadata.get('filename'):
            raise Exception('Request metadata missing filename')

        folder, pretty_folder = cls._parse_upload_folders(mine, document_category)
        data = {
            'folder': folder,
            'pretty_folder': pretty_folder,
            'filename': metadata.get('filename')
        }
        current_app.logger.error(cls.document_manager_url)
        resp = requests.post(
            url=cls.document_manager_url,
            headers={key: value
                     for (key, value) in request.headers if key != 'Host'},
            data=data,
            cookies=request.cookies,
        )

        return Response(str(resp.content), resp.status_code, resp.raw.headers.items())

    @classmethod
    def pushFileToDocumentManager(cls, docgen_resp, headers):      #, mine, document_category):
        current_app.logger.debug(docgen_resp.headers)
                                                                   #       folder, pretty_folder = cls._parse_upload_folders(mine, document_category)
        data = {
            'folder': 'test',
            'pretty_folder': 'test',
            'filename': docgen_resp.headers['Carbone-Report-Name']
        }
                                                                   # headers = docgen_resp.headers
                                                                   # headers['Upload-Length'] = headers['Content-Length']

        my_client = client.TusClient(cls.document_manager_url, headers=data) #, headers=headers)

        filestream = open('/app/README.md')

        uploader = my_client.uploader(file_stream=filestream, chunk_size=2048)
        uploader.upload()

    @classmethod
    def _parse_upload_folders(cls, mine, document_category):
        if document_category not in ALLOWED_DOCUMENT_CATEGORIES:
            raise Exception(
                f'CONFIGURATION ERROR: Document Manager Folder \'{document_category}\' not allowed, must be one of {ALLOWED_DOCUMENT_CATEGORIES}.'
            )

        folder = f'mines/{str(mine.mine_guid)}/{document_category}'
        pretty_folder = f'mines/{mine.mine_no}/{document_category}'

        return folder, pretty_folder

    @classmethod
    def _parse_request_metadata(cls, request):
        request_metadata = request.headers.get("Upload-Metadata")
        metadata = {}
        if not request_metadata:
            return metadata

        for key_value in request_metadata.split(","):
            (key, value) = key_value.split(" ")
            metadata[key] = base64.b64decode(value).decode("utf-8")

        return metadata

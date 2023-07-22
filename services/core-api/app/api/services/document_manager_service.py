import requests
import base64
import io
import json
from tusclient import client

from flask import Response, current_app
from flask_restplus import marshal, fields
from app.config import Config
from app.api.now_applications.response_models import NOW_SUBMISSION_DOCUMENT
from app.api.now_applications.models.now_application_document_identity_xref import NOWApplicationDocumentIdentityXref
from app.api.mines.documents.mine_document_search_util import MineDocumentSearchUtil

ALLOWED_DOCUMENT_CATEGORIES = [
    'tailings', 'permits', 'variances', 'incidents', 'reports', 'mine_party_appts', 'noticeofwork',
    'bonds', 'reclamation_invoices', 'explosives_permits', 'project_summaries',
    'notices_of_depature', 'information_requirements_table', 'major_mine_application', 'project_decision_package'
]


class DocumentManagerService():
    document_manager_document_resource_url = f'{Config.DOCUMENT_MANAGER_URL}/documents'
    
    @classmethod
    def validateFileNameAndInitializeFileUploadWithDocumentManager(cls, request, mine, project_guid, document_category):

        metadata = cls._parse_request_metadata(request)
        file_name = metadata.get('filename')
        mine_document = MineDocumentSearchUtil.find_by_document_name_and_project_guid(file_name, project_guid)

        if not mine_document: # No existing file found in this application hence continuing the file uploading
          return DocumentManagerService.initializeFileUploadWithDocumentManager(request, mine, document_category)
        elif mine_document.is_archived: # An archived file with the same name in this application found, hence responing with 409
            content = f'{{"description" : "File already exist with the given name: {file_name}. Replace with the new version", "status_code": 409, "status": "ARCHIVED_FILE_EXIST"}}'
            return Response(content, 409)
        else: # The found file with the same name in this application is not archived.
            content = f'{{"description" : "Archived file already exist with the given name: {file_name}", "status_code": 409, "status": "REPLACEABLE_FILE_EXIST"}}'
            return Response(content, 409, content_type='application/json')

    @classmethod
    def initializeFileUploadWithDocumentManager(cls, request, mine, document_category):
        metadata = cls._parse_request_metadata(request)

        folder, pretty_folder = cls._parse_upload_folders(mine, document_category)
        data = {
            'folder': folder,
            'pretty_folder': pretty_folder,
            'filename': metadata.get('filename')
        }

        resp = requests.post(
            url=cls.document_manager_document_resource_url,
            headers={key: value
                     for (key, value) in request.headers if key != 'Host'},
            data=data,
            cookies=request.cookies)

        return Response(str(resp.content), resp.status_code, resp.raw.headers.items())

    @classmethod
    def initializeFileVersionUploadWithDocumentManager(cls, request, mine_document):
        metadata = cls._parse_request_metadata(request)

        data = {
            'filename': metadata.get('filename')
        }

        version_url = f'{cls.document_manager_document_resource_url}/{mine_document.document_manager_guid}/versions'

        resp = requests.post(
            url=version_url,
            headers={key: value
                     for (key, value) in request.headers if key != 'Host'},
            data=data,
            cookies=request.cookies)

        return Response(str(resp.content), resp.status_code, resp.raw.headers.items())

    @classmethod
    def importNoticeOfWorkSubmissionDocuments(cls, request, now_application):
        data = {
            'now_application_id':
            now_application.now_application_id,
            'submission_documents':
            marshal(now_application.submission_documents, NOW_SUBMISSION_DOCUMENT),
            'now_application_guid':
            str(now_application.now_application_guid)
        }

        resp = requests.post(
            url=f'{Config.DOCUMENT_MANAGER_URL}/import-now-submission-documents',
            headers={key: value
                     for (key, value) in request.headers if key != 'Host'},
            data=json.dumps(data))

        return Response(resp.content, resp.status_code, resp.raw.headers.items())

    @classmethod
    def pushFileToDocumentManager(cls, file_content, filename, mine, document_category,
                                  authorization_header):
        folder, pretty_folder = cls._parse_upload_folders(mine, document_category)
        data = {
            'folder': folder,
            'pretty_folder': pretty_folder,
            'filename': filename,
            'authorization': authorization_header
        }

        my_client = client.TusClient(cls.document_manager_document_resource_url, headers=data)
        uploader = my_client.uploader(
            file_stream=io.BytesIO(file_content),
            chunk_size=Config.DOCUMENT_UPLOAD_CHUNK_SIZE_BYTES)
        uploader.upload()
        document_manager_guid = uploader.url.rsplit('/', 1)[-1]
        return document_manager_guid

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
        request_metadata = request.headers.get('Upload-Metadata')
        metadata = {}
        if not request_metadata:
            return metadata

        for key_value in request_metadata.split(','):
            (key, value) = key_value.split(' ')
            metadata[key] = base64.b64decode(value).decode('utf-8')

        if not metadata or not metadata.get('filename'):
            raise Exception('Request metadata missing filename')

        return metadata

    @classmethod
    def get_document_version(cls, request, document_manager_guid, document_manager_version_guid):
        resp = requests.get(
            url=f'{Config.DOCUMENT_MANAGER_URL}/documents/{document_manager_guid}/versions/{document_manager_version_guid}',
            headers={key: value
                     for (key, value) in request.headers if key != 'Host'},
        )

        return resp.json()

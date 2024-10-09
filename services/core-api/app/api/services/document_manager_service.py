import base64
import io
import json
import logging
import re
import time
import uuid

import requests
from app.api.constants import DOWNLOAD_TOKEN, TIMEOUT_5_MINUTES
from app.api.mines.documents.mine_document_search_util import MineDocumentSearchUtil
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.now_applications.models.now_application_document_identity_xref import (
    NOWApplicationDocumentIdentityXref,
)
from app.api.now_applications.response_models import NOW_SUBMISSION_DOCUMENT
from app.config import Config
from app.extensions import cache
from flask import Response, current_app
from flask import request as flask_request
from flask_restx import fields, marshal
from tusclient import client

logger = logging.getLogger(__name__)

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

        resp = None

        if not mine_document: # No existing file found in this application hence continuing the file uploading
          resp = DocumentManagerService.initializeFileUploadWithDocumentManager(request, mine, document_category)

        elif mine_document.is_archived: # An archived file with the same name in this application found, hence responing with 409
            content = {
                "description" : f"Archived file already exist with the given name: {file_name}",
                "status_code": 409,
                "status": "ARCHIVED_FILE_EXIST",
                "file_name": file_name,
                "mine_guid": str(mine_document.mine_guid),
                "file_type": mine_document.document_class,
                "update_timestamp": str(mine_document.update_timestamp),
                "update_user": mine_document.update_user,
                "mine_document_guid": str(mine_document.mine_document_guid)
            }
            resp = Response(json.dumps(content), 409, content_type='application/json')

        else: # The found file with the same name in this application is not archived.
            content = {
                "description" : f"File already exist with the given name: {file_name}. Replace with the new version",
                "status_code": 409,
                "status": "REPLACEABLE_FILE_EXIST",
                "file_name": file_name,
                "mine_guid": str(mine_document.mine_guid),
                "file_type": mine_document.document_class,
                "update_timestamp": str(mine_document.update_timestamp),
                "update_user": mine_document.update_user,
                "mine_document_guid": str(mine_document.mine_document_guid)
            }
            resp = Response(json.dumps(content), 409, content_type='application/json')

        return resp

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
        current_app.logger.info('[MDS-5629][%s] - Uploading file details: %s', __class__.__name__, str(data))
        resp = requests.post(
            url=cls.document_manager_document_resource_url,
            headers={key: value
                     for (key, value) in request.headers if key != 'Host' and key != 'Content-Type'},
            json=data,
            cookies=request.cookies)
        current_app.logger.info('[MDS-5629][%s] - Response for %s, file upload: %s', __class__.__name__, metadata.get('filename'), str(resp.json()))

        return Response(json.dumps(resp.json()), resp.status_code, resp.raw.headers.items())

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
                     for (key, value) in request.headers if key != 'Host' and key != 'Content-Type'},
            data=data,
            cookies=request.cookies)

        if resp.status_code == 201:
            mine_document.document_name = metadata.get('filename')
            mine_document.save()

        return Response(json.dumps(resp.json()), resp.status_code, resp.raw.headers.items())

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
            'prettyFolder': pretty_folder,
            'filename': filename,
            'authorization': authorization_header
        }

        my_client = client.TusClient(cls.document_manager_document_resource_url, headers=data)
        uploader = my_client.uploader(
            file_stream=io.BytesIO(file_content),
            chunk_size=Config.DOCUMENT_UPLOAD_CHUNK_SIZE_BYTES)
        uploader.upload()

        document_manager_guid = uploader.url.rsplit('/', 1)[-1]

        cls.wait_for_document_upload(document_manager_guid, timeout=60)

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

    @classmethod
    def initialize_document_zip(cls, request, document_manager_guids, zip_file_name):
        """
        Initializes a document zip operation by sending a POST request to the Document Manager API.

        :param request: The Flask request object.
        :param document_manager_guids: A list of document GUIDs to include in the zip file.
        :param zip_file_name: The name to give the zip file (this will default to the mine number and the dateTime if not provided).
        :return: A JSON object containing the following keys:
            - "message": A message indicating that a create_zip job has been added to the task queue.
            - "task_id": The ID of the create_zip job that was added to the task queue.
        """

        current_app.logger.info("inside initialize_document_zip")
        current_app.logger.info(request.headers)

        resp = requests.post(
            url=f'{Config.DOCUMENT_MANAGER_URL}/documents/zip',
            headers={key: value
                    for (key, value) in request.headers if key != 'Host'},
            data=json.dumps({'document_manager_guids': document_manager_guids, 'zip_file_name': zip_file_name}))
        
        current_app.logger.info("RESP")
        current_app.logger.info(resp)

        current_app.logger.info(f'initialize_document_zip: {resp.content}')

        return resp.json()
    
    @classmethod
    def poll_zip_progress(cls, request, task_id):
        """
        Polls the Document Manager API for the progress of a document zip operation.

        :param request: The Flask request object.
        :param task_id: The ID of the zip task to poll.
        :return: The JSON response from the Document Manager API, which includes:
            - The progress of the zip operation
            - The current state of the operation
            - If successful, the newly created document_guid
            - An array of errors, empty if none
        """
        resp = requests.get(
            url=f'{Config.DOCUMENT_MANAGER_URL}/documents/zip/{task_id}',
            headers={key: value
                    for (key, value) in request.headers if key != 'Host'})

        return resp.json()

    @classmethod
    def poll_upload_progress(cls, request, document_manager_guid):
        resp = requests.get(
            url=f'{Config.DOCUMENT_MANAGER_URL}/documents/{document_manager_guid}/upload-status',
            headers={key: value
                    for (key, value) in request.headers if key != 'Host'})
        return resp.json()
    

    @classmethod
    def wait_for_document_upload(cls, document_manager_guid, timeout=60):
        """
        Waits for a document upload to finish - Happens when it no longer has the "In Progress" status.
        This is necessary in order to check the status of an upload performed using the Tusd client, seeing
        as the post-finish hook which copies the file to its final destination happens asynchronously.

        :param document_manager_guid: GUID of docman document to check status for
        :timeout: How long the method should wait for before timing out
        """
        status = "In Progress"
        current_time = time.time()

        while status == "In Progress":
            resp = cls.poll_upload_progress(flask_request, document_manager_guid)

            status = resp["status"]

            if status == "Success":
                return document_manager_guid
            elif status != "In Progress":
                raise Exception(status)

            if timeout is not None and time.time() > current_time + timeout:
                raise Exception('Timed out while waiting for file upload to finish')

            time.sleep(1)

    @classmethod
    def create_download_token(cls, document_guid):
        token_guid = uuid.uuid4()
        cache.set(DOWNLOAD_TOKEN(token_guid), document_guid, TIMEOUT_5_MINUTES)
        return token_guid

    @classmethod
    def download_document_to_file(cls, document_guid, file_obj):
        token = cls.create_download_token(document_guid)

        resp = requests.get(
            url=f'{Config.DOCUMENT_MANAGER_URL}/documents?token={token}',
            headers=flask_request.headers,
            stream=True
        )
        
        if resp.status_code != 200:
            raise Exception(f'Failed to download document. {resp.status_code}: {resp.text}')

        file_name = None

        content_disposition = resp.headers['content-disposition']

        if content_disposition:
            fname = re.findall("filename=(.+)", content_disposition)

            if len(fname) > 0:
                file_name = fname[0]

        for chunk in resp.iter_content(chunk_size=1024):
            if chunk:
                file_obj.write(chunk)
        return file_name, file_obj
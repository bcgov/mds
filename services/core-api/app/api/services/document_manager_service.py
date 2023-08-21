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
from app.api.projects.project.models.project import Project

from app.api.activity.utils import trigger_notification
from app.api.activity.models.activity_notification import ActivityType
from app.api.activity.utils import ActivityRecipients


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
          resp = DocumentManagerService.initializeFileUploadWithDocumentManager(request, mine, document_category, project_guid)

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
    def initializeFileUploadWithDocumentManager(cls, request, mine, document_category, project_guid):
        metadata = cls._parse_request_metadata(request)
        if not metadata or not metadata.get('filename'):
            raise Exception('Request metadata missing filename')

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

        resp = Response(str(resp.json()), resp.status_code, resp.raw.headers.items())

        if Config.ENVIRONMENT_NAME != 'prod':
            project = Project.find_by_project_guid(project_guid)

            if resp:
                renotify_hours = 24
                trigger_notification(f'File(s) in project {project.project_title} has been updated for mine {mine.mine_name}.',
                    ActivityType.new_file_uploaded, mine, 'DocumentManagement', project_guid, None, None, ActivityRecipients.core_users, True, renotify_hours*60)

        return resp

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

        return Response(str(resp.json()), resp.status_code, resp.raw.headers.items())

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

    @classmethod
    def initialize_document_zip(cls, request, mine_document_guids, zip_file_name):
        """
        Initializes a document zip operation by sending a POST request to the Document Manager API.

        :param request: The Flask request object.
        :param mine_document_guids: A list of document GUIDs to include in the zip file.
        :param zip_file_name: The name to give the zip file (this will default to the mine number and the dateTime if not provided).
        :return: A JSON object containing the following keys:
            - "message": A message indicating that a create_zip job has been added to the task queue.
            - "task_id": The ID of the create_zip job that was added to the task queue.
        """
        resp = requests.post(
            url=f'{Config.DOCUMENT_MANAGER_URL}/documents/zip',
            headers={key: value
                    for (key, value) in request.headers if key != 'Host'},
            data=json.dumps({'mine_document_guids': mine_document_guids, 'zip_file_name': zip_file_name}))

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
        """
        resp = requests.get(
            url=f'{Config.DOCUMENT_MANAGER_URL}/documents/zip/{task_id}',
            headers={key: value
                    for (key, value) in request.headers if key != 'Host'})

        return resp.json()
    

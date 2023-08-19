import decimal
import uuid

from app.api.mines.documents.dto import CREATE_DOCUMENT_VERSION

from app.api.mines.documents.models.mine_document_version import MineDocumentVersion

from flask import request
from flask_restplus import Resource, reqparse, fields
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound

from app.extensions import api
from app.api.utils.access_decorators import EDIT_INFORMATION_REQUIREMENTS_TABLE, EDIT_MAJOR_MINE_APPLICATIONS, EDIT_PROJECT_DECISION_PACKAGES, EDIT_PROJECT_SUMMARIES, MINE_ADMIN, requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.documents.models.mine_document import MineDocument
from app.api.mines.mine.models.mine import Mine

from app.api.mines.response_models import MINE_DOCUMENT_MODEL, MINE_DOCUMENT_VERSION_MODEL
from app.api.services.document_manager_service import DocumentManagerService


from app.api.activity.utils import trigger_notification
from app.api.activity.models.activity_notification import ActivityType
from app.api.projects.project.models.project import Project
from app.api.activity.utils import ActivityRecipients

from app.config import Config

class MineDocumentVersionUploadResource(Resource, UserMixin):

    @api.doc(
        description='Request a document_manager_version_guid for uploading a document',
        params={
            'mine_guid': 'The GUID of the mine the document belongs to',
            'mine_document_guid': 'The GUID of the MineDocument to request a new version for'
        }
    )
    @api.response(200, 'Successfully requested new document manager version')
    @requires_any_of([MINE_ADMIN, EDIT_MAJOR_MINE_APPLICATIONS, EDIT_PROJECT_DECISION_PACKAGES, MINESPACE_PROPONENT, EDIT_PROJECT_SUMMARIES, EDIT_INFORMATION_REQUIREMENTS_TABLE])
    def post(self, mine_guid, mine_document_guid):
        project_guid = request.args.get('project_guid', type=str)
        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine:
            raise NotFound('Mine not found.')

        mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)

        if not mine_document:
            raise NotFound('Mine document not found.')

        if str(mine_document.mine_guid) != mine_guid:
            raise BadRequest('Mine document not attached to Mine')

        if mine_document.is_archived:
            raise BadRequest('Cannot create new version of archived document')

        resp = DocumentManagerService.initializeFileVersionUploadWithDocumentManager(
            request, mine_document)
        project_name = Project.find_by_project_guid(project_guid)

        if resp:
            renotify_hours = 24
            trigger_notification(f'File(s) in project {project_name} has been updated for mine {mine.mine_name}.',
                  ActivityType.file_version_updated, mine, 'DocumentManagement', project_guid, None, None, ActivityRecipients.core_users, True, renotify_hours*60)

        return resp


class MineDocumentVersionListResource(Resource, UserMixin):
    parser = reqparse.RequestParser()
    parser.add_argument(
        'document_manager_version_guid',
        type=str,
        location='json',
        required=True,
        help='GUID of the document manager version to create a new MineDocumentVersion for')

    @api.doc(
        description='Creates a new document version for the given MineDocument',
        params={
            'mine_guid': 'The GUID of the mine the document belongs to',
            'mine_document_guid': 'The GUID of the MineDocument to request a new version for'
        }
    )
    @api.expect(CREATE_DOCUMENT_VERSION)
    @api.marshal_with(MINE_DOCUMENT_VERSION_MODEL)
    @api.response(200, 'Successfully requested new document manager version')
    @requires_any_of([MINE_ADMIN, EDIT_MAJOR_MINE_APPLICATIONS, EDIT_PROJECT_DECISION_PACKAGES, MINESPACE_PROPONENT, EDIT_PROJECT_SUMMARIES, EDIT_INFORMATION_REQUIREMENTS_TABLE])
    def post(self, mine_guid, mine_document_guid):
        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine:
            raise NotFound('Mine not found.')

        mine_document = MineDocument.find_by_mine_document_guid(mine_document_guid)

        if not mine_document:
            raise NotFound('Mine document not found.')

        if str(mine_document.mine_guid) != mine_guid:
            raise BadRequest('Mine document not attached to Mine')

        if mine_document.is_archived:
            raise BadRequest('Cannot create new version of archived document')

        args = self.parser.parse_args()

        return MineDocumentVersion.create_from_docman_version(
            mine_document=mine_document,
            document_manager_version_guid=args.get('document_manager_version_guid'),
        )

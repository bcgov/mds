import decimal
import uuid

from flask import request
from flask_restplus import Resource, reqparse, fields
from datetime import datetime
from werkzeug.exceptions import BadRequest, NotFound

from app.extensions import api
from app.api.utils.access_decorators import EDIT_MAJOR_MINE_APPLICATIONS, MINE_ADMIN, requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin

from app.api.mines.documents.models.mine_document import MineDocument
from app.api.mines.mine.models.mine import Mine
from app.api.mines.documents.mine_document_search_util import MineDocumentSearchUtil

from app.api.mines.response_models import ARCHIVE_MINE_DOCUMENT, MINE_DOCUMENT_MODEL

from app.api.services.document_manager_service import DocumentManagerService


from app.api.activity.utils import trigger_notification
from app.api.activity.models.activity_notification import ActivityType

from app.api.activity.utils import ActivityRecipients
from app.api.projects.project.projects_search_util import ProjectsSearchUtil
from app.api.projects.project.models.project import Project

class MineDocumentListResource(Resource, UserMixin):
    @api.doc(description='Returns list of documents associated with mines')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(MINE_DOCUMENT_MODEL, code=200, envelope='records')
    def get(self, mine_guid):
        parser = reqparse.RequestParser()

        parser.add_argument(
            'is_archived',
            type=bool,
            help='Include archived documents',
            location='args',
            required=False
        )

        parser.add_argument(
            'project_guid',
            type=str,
            help='Filter by documents for given project',
            location='args',
            required=False
        )

        parser.add_argument(
            'project_summary_guid',
            type=str,
            help='Filter by documents for given project summary',
            location='args',
            required=False
        )

        parser.add_argument(
            'project_decision_package_guid',
            type=str,
            help='Filter by documents for given project decision package',
            location='args',
            required=False
        )

        parser.add_argument(
            'major_mine_application_guid',
            type=str,
            help='Filter by documents for given major mine application guid',
            location='args',
            required=False
        )

        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine:
            raise NotFound('Mine not found.')

        args = parser.parse_args()

        return MineDocumentSearchUtil.filter_by(
            mine_guid=mine.mine_guid,
            is_archived=args.get('is_archived'),
            project_guid=args.get('project_guid'),
            project_summary_guid=args.get('project_summary_guid'),
            project_decision_package_guid=args.get('project_decision_package_guid'),
            major_mine_application_guid=args.get('major_mine_application_guid')
        )


class MineDocumentArchiveResource(Resource, UserMixin):
    parser = reqparse.RequestParser()

    parser.add_argument(
        'mine_document_guids',
        type=list,
        help='Mine Document GUIDs',
        location='json',
        required=True
    )

    @api.doc(
        description='Archives the given mine documents.',
        params={
            'mine_guid': 'The GUID of the mine the documents belongs to.',
            'mine_document_guids': 'The GUID of the Mine Documents to Archive.'
        }
    )
    @requires_any_of([MINE_ADMIN, EDIT_MAJOR_MINE_APPLICATIONS])
    @api.expect(ARCHIVE_MINE_DOCUMENT)
    @api.response(204, 'Successfully archived documents')
    def patch(self, mine_guid):
        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine:
            raise NotFound('Mine not found.')

        args = self.parser.parse_args()
        mine_document_guids = args.get('mine_document_guids')

        documents = MineDocument.find_by_mine_document_guid_many(mine_document_guids)

        if len(documents) != len(mine_document_guids):
            found_doc_guids = [str(d.mine_document_guid) for d in documents]
            difference = set(mine_document_guids) - set(found_doc_guids)

            raise NotFound(f'The following document(s) are not associated with the given mine: {", ".join(difference)}')

        for document in documents:
            if str(document.mine_guid) != str(mine_guid):
                raise BadRequest('Document not attached to mine')

        MineDocument.mark_as_archived_many(mine_document_guids)

        if len(mine_document_guids) > 0:
            project = ProjectsSearchUtil.find_by_mine_document_guid(mine_document_guids[0])
            renotifiy_hours = 24
            trigger_notification(f'File(s) in project {project.project_title} has been updated for mine {mine.mine_name}.',
                    ActivityType.mine_project_documents_updated, mine, 'DocumentManagement', project.project_guid, None, None, ActivityRecipients.core_users, True, renotifiy_hours*60)

        return None, 204

class MineDocumentZipResource(Resource, UserMixin):
    parser = reqparse.RequestParser()

    parser.add_argument(
        'mine_document_guids',
        type=list,
        help='Mine Document GUIDs',
        location='json',
        required=True
    )
    
    parser.add_argument(
        'zip_file_name',
        type=str,
        help='The name for the zipped file',
        location='json',
        required=False
    )
    
    api.doc(
        description='Initializes the zipping of the given mine documents and returns an id for the file to be watched.')
    
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.expect(ARCHIVE_MINE_DOCUMENT)
    @api.response(200, 'Successfully initialized zipping of documents')
    def post(self, mine_guid):        
        mine = Mine.find_by_mine_guid(mine_guid)

        if not mine:
            raise NotFound('Mine not found.')
        
        args = self.parser.parse_args()
        mine_document_guids = args.get('mine_document_guids')
        zip_file_name = args.get('zip_file_name')
        
        if not zip_file_name:
            zip_file_name = f'{mine.mine_no}_{datetime.utcnow().strftime("%Y-%m-%d_%H-%M-%S")}.zip'
        
        if not mine_document_guids:
            raise BadRequest('No document guids provided')

        return DocumentManagerService.initialize_document_zip(request, mine_document_guids, zip_file_name)
    
    
class MineDocumentZipProgressResource(Resource, UserMixin):
    api.doc(
        'Returns the progress of the zipping of the given mine documents.',
        )
    
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self, task_id):
        
        if not task_id:
            raise BadRequest('No task id provided')
                
        return DocumentManagerService.poll_zip_progress(request, task_id)
    
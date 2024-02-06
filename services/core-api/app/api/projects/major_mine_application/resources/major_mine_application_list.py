from app.extensions import api
from flask_restx import Resource
from werkzeug.exceptions import NotFound, InternalServerError

from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.utils.access_decorators import MINE_ADMIN, requires_any_of, MINESPACE_PROPONENT
from app.api.projects.project.models.project import Project
from app.api.projects.response_models import MAJOR_MINE_APPLICATION_MODEL

from app.api.projects.major_mine_application.models.major_mine_application import MajorMineApplication


class MajorMineApplicationListResource(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument('status_code', type=str, store_missing=False)
    parser.add_argument('documents', type=list, location='json', store_missing=False)

    @api.doc(
        description='Create a new Mine Major Application.',
        params={'project_guid': 'GUID of the project associated to the major mine application'})
    @api.expect(MAJOR_MINE_APPLICATION_MODEL)
    @api.marshal_with(MAJOR_MINE_APPLICATION_MODEL, code=201)
    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT])
    def post(self, project_guid):
        data = self.parser.parse_args()
        project = Project.find_by_project_guid(project_guid)

        if project is None:
            raise NotFound('Project not found')

        major_mine_application = MajorMineApplication.create(project,
                                                             data.get('status_code'),
                                                             data.get('documents'))

        try:
            major_mine_application.save()

        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')

        return major_mine_application, 201

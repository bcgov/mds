from flask import request
from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.mines.mine.models.mine import Mine
from app.api.utils.access_decorators import MINESPACE_PROPONENT, requires_any_of, VIEW_ALL
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.projects.response_models import PROJECT_MODEL
from app.api.projects.project.models.project import Project


class ProjectResource(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument(
        'mrc_review_required',
        type=bool,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'contacts',
        type=list,
        location='json',
        store_missing=False,
        required=True,
    )

    @api.doc(
        description='Get a Project.', params={'project_guid': 'The GUID of the Project to get.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PROJECT_MODEL, code=200)
    def get(self, project_guid):
        project = Project.find_by_project_guid(project_guid)
        if project is None:
            raise NotFound('Project not found')

        return project

    @api.doc(
        description='Update a Project.', params={'project_guid': 'The GUID of the Project to get.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PROJECT_MODEL, code=200)
    def put(self, project_guid):
        project = Project.find_by_project_guid(project_guid)
        if project is None:
            raise NotFound('Project not found')

        data = self.parser.parse_args()
        project.update(project.project_title, project.proponent_project_id,
                       project.project_lead_party_guid, data.get('mrc_review_required', False),
                       data.get('contacts', []))
        updated_project = project.save()

        return updated_project, 201


class ProjectListResource(Resource, UserMixin):
    @api.doc(
        description='Get a list of all Projects for a given mine.',
        params={'mine_guid': 'The GUID of the mine to get Projects for.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PROJECT_MODEL, code=200, envelope='records')
    def get(self):
        mine_guid = request.args.get('mine_guid', type=str)
        mine = Mine.find_by_mine_guid(mine_guid)
        if mine is None:
            raise NotFound('Mine not found')

        projects = Project.find_by_mine_guid(mine_guid)
        return projects

from flask import request
from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.mines.mine.models.mine import Mine
from app.api.utils.access_decorators import MINESPACE_PROPONENT, requires_any_of, VIEW_ALL
from app.api.utils.resources_mixins import UserMixin

from app.api.projects.project.response_models import PROJECT_MODEL
from app.api.projects.project.models.project import Project


class ProjectResource(Resource, UserMixin):
    @api.doc(
        description='Get a Project.', params={'project_guid': 'The GUID of the Project to get.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PROJECT_MODEL, code=200)
    def get(self, project_guid):
        project = Project.find_by_project_guid(project_guid)
        if project is None:
            raise NotFound('Project not found')

        return project


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

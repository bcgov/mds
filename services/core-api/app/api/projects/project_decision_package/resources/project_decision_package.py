from flask_restx import Resource
from werkzeug.exceptions import NotFound, InternalServerError

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, MINE_ADMIN, EDIT_PROJECT_DECISION_PACKAGES
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.projects.response_models import PROJECT_DECISION_PACKAGE_MODEL
from app.api.projects.project_decision_package.models.project_decision_package import ProjectDecisionPackage
from app.api.projects.project.models.project import Project


class ProjectDecisionPackageResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'status_code',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'documents',
        type=list,
        location='json',
        store_missing=False,
        required=False,
    )

    @api.doc(
        description="Get a Decision Package for a given project.",
        params={'project_guid': 'The GUID of the project to get decision packages for.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PROJECT_DECISION_PACKAGE_MODEL, code=200)
    def get(self, project_guid, project_decision_package_guid):
        project_decision_package = ProjectDecisionPackage.find_by_project_decision_package_guid(
            project_decision_package_guid)
        if project_decision_package is None:
            raise NotFound('Project decision package not found.')

        return project_decision_package

    @api.doc(
        description='Update a project decision package.',
        params={
            'project_guid': 'The GUID of the project the Decision Package belongs to.',
            'project_decision_package_guid': 'The GUID of the project decision package to update.'
        })
    @requires_any_of([MINE_ADMIN, EDIT_PROJECT_DECISION_PACKAGES])
    @api.marshal_with(PROJECT_DECISION_PACKAGE_MODEL, code=200)
    def put(self, project_guid, project_decision_package_guid):
        project_decision_package = ProjectDecisionPackage.find_by_project_decision_package_guid(project_decision_package_guid)

        project = Project.find_by_project_guid(project_guid)

        data = self.parser.parse_args()

        if project_decision_package is None:
            raise NotFound('Project Decision Package not found')

        if project is None:
            raise NotFound('Project is not found')

        new_status_code = data.get('status_code')
        project_decision_package.update(project,
                                        new_status_code,
                                        data.get('documents', []))

        project_decision_package.save()

        return project_decision_package


class ProjectDecisionPackageListResource(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument('status_code', type=str, store_missing=False)
    parser.add_argument('documents', type=list, location='json', store_missing=False)

    @api.doc(
        description='Create a new Project Decision Package.',
        params={'project_guid': 'GUID of the project associated to the project decision package'})
    @api.expect(PROJECT_DECISION_PACKAGE_MODEL)
    @api.marshal_with(PROJECT_DECISION_PACKAGE_MODEL, code=201)
    @requires_any_of([MINE_ADMIN, EDIT_PROJECT_DECISION_PACKAGES])
    def post(self, project_guid):
        data = self.parser.parse_args()
        project = Project.find_by_project_guid(project_guid)

        if project is None:
            raise NotFound('Project not found')

        project_decision_package = ProjectDecisionPackage.create(project,
                                                                 data.get('status_code'),
                                                                 data.get('documents', []))

        try:
            project_decision_package.save()

        except Exception as e:
            raise InternalServerError(f'Error when saving: {e}')

        return project_decision_package, 201

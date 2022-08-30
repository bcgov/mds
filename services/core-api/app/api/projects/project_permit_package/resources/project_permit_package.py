from flask_restplus import Resource
from werkzeug.exceptions import NotFound, InternalServerError

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, MINE_ADMIN, EDIT_PROJECT_PERMIT_PACKAGES
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.projects.response_models import PROJECT_PERMIT_PACKAGE_MODEL
from app.api.projects.major_mine_application.models.major_mine_application import MajorMineApplication
from app.api.projects.project_permit_package.models.project_permit_package import ProjectPermitPackage
from app.api.projects.project.models.project import Project


class ProjectPermitPackageResource(Resource, UserMixin):
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
        description="Get a Permit Package for a given project.",
        params={'project_guid': 'The GUID of the project to get permit packages for.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PROJECT_PERMIT_PACKAGE_MODEL, code=200)
    def get(self, project_guid, project_permit_package_guid):
        project_permit_package = ProjectPermitPackage.find_by_project_permit_package_guid(
            project_permit_package_guid)
        if project_permit_package is None:
            raise NotFound('Project permit package not found.')

        return project_permit_package

    @api.doc(
        description='Update a project permit package.',
        params={
            'project_guid': 'The GUID of the project the Permit Package belongs to.',
            'project_permit_package_guid': 'The GUID of the project permit package to update.'
        })
    @requires_any_of([MINE_ADMIN, EDIT_PROJECT_PERMIT_PACKAGES])
    @api.marshal_with(PROJECT_PERMIT_PACKAGE_MODEL, code=200)
    def put(self, project_guid, project_permit_package_guid):
        project_permit_package = ProjectPermitPackage.find_by_project_permit_package_guid(project_permit_package_guid)

        project = Project.find_by_project_guid(project_guid)

        data = self.parser.parse_args()

        if project_permit_package is None:
            raise NotFound('Project Permit Package not found')

        if project is None:
            raise NotFound('Project is not found')

        new_status_code = data.get('status_code')
        project_permit_package.update(project,
                                      new_status_code,
                                      data.get('documents', []))

        project_permit_package.save()

        return project_permit_package


class ProjectPermitPackageListResource(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument('status_code', type=str, store_missing=False)
    parser.add_argument('documents', type=list, location='json', store_missing=False)

    @api.doc(
        description='Create a new Project Permit Package.',
        params={'project_guid': 'GUID of the project associated to the project permit package'})
    @api.expect(PROJECT_PERMIT_PACKAGE_MODEL)
    @api.marshal_with(PROJECT_PERMIT_PACKAGE_MODEL, code=201)
    @requires_any_of([MINE_ADMIN, EDIT_PROJECT_PERMIT_PACKAGES])
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

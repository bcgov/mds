from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.projects.response_models import PROJECT_PERMIT_PACKAGE_STATUS_CODE_MODEL

from app.api.projects.project_permit_package.models.project_permit_package_status_code import ProjectPermitPackageStatusCode
from app.api.utils.resources_mixins import UserMixin


class ProjectPermitPackageStatusCodeResource(Resource, UserMixin):
    @api.marshal_with(PROJECT_PERMIT_PACKAGE_STATUS_CODE_MODEL, code=200, envelope='records')
    @api.doc(
        description='Get all active project permit status codes', )
    @requires_role_view_all
    def get(self):
        status_codes = ProjectPermitPackageStatusCode.get_all()
        if not status_codes:
            raise NotFound('No status codes found.')

        return status_codes

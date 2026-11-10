from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_edit_permit, requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.now_applications.models.now_application_consultation_package import NOWApplicationConsultationPackage
from app.api.now_applications.resources.now_application_package_resource_base import PackageListResourceMixin
from app.api.now_applications.response_models import NOW_APPLICATION_CONSULTATION_PACKAGE


class NOWApplicationConsultationPackageListResource(PackageListResourceMixin, Resource, UserMixin):
    package_model = NOWApplicationConsultationPackage
    package_label = 'consultation'

    @api.doc(description='Retrieve consultation packages for a Notice of Work application')
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_CONSULTATION_PACKAGE, envelope='records', code=200)
    def get(self, application_guid):
        return self._list_packages(application_guid)

    @api.doc(description='Create a new consultation package snapshot for a Notice of Work application')
    @requires_role_edit_permit
    @api.marshal_with(NOW_APPLICATION_CONSULTATION_PACKAGE, code=201)
    def post(self, application_guid):
        return self._create_package(application_guid)

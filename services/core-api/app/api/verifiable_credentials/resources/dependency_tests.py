from app.api.services.orgbook_publisher import OrgbookPublisherService
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask_restx import Resource


class OrgbookPublisherConnectionResource(Resource, UserMixin):
    
    @api.doc(
        description=
        "Endpoint to test connection and authentication to Orgbook Publisher.",
        params={})
    @requires_role_view_all
    def post(self):
        orgbook_service = OrgbookPublisherService()
        return orgbook_service.get_new_token()
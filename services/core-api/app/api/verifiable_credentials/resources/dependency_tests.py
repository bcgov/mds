from flask import current_app, request
from flask_restx import Resource, reqparse
from app.api.utils.access_decorators import requires_any_of, MINESPACE_PROPONENT, EDIT_PARTY, VIEW_ALL

from app.config import Config
from app.extensions import api

from app.api.utils.resources_mixins import UserMixin
from app.api.services.orgbook_publisher import OrgbookPublisherService

from app.api.utils.feature_flag import Feature, is_feature_enabled
class OrgbookPublisherConnectionResource(Resource, UserMixin):
    
    @api.doc(
        description=
        "Endpoint to test connection and authentication to Orgbook Publisher.",
        params={})
    def post(self):
        orgbook_service = OrgbookPublisherService()
        return orgbook_service.get_new_token()
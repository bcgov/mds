from flask_restx import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.response_models import NOW_APPLICATION_TIER_HISTORY


class NOWApplicationTierHistoryResource(Resource, UserMixin):
    @api.doc(description='Get the tier history for a Notice of Work application.')
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_TIER_HISTORY, as_list=True, code=200)
    def get(self, application_guid):
        now_application_identity = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application_identity:
            raise NotFound('No identity record for this application guid.')

        application = now_application_identity.now_application
        if not application:
            raise NotFound('No application record for this application guid.')

        if not application.application_tier:
            return []

        return application.application_tier.history

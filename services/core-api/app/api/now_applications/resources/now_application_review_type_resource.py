from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all

from app.api.utils.resources_mixins import UserMixin
from app.api.now_applications.models.now_application_review_type import NOWApplicationReviewType
from app.api.now_applications.response_models import NOW_APPLICATION_REVIEW_TYPES


class NOWApplicationReviewTypeResource(Resource, UserMixin):
    @api.doc(description='Get a list of all Notice of Work Review types.', params={})
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_REVIEW_TYPES, code=200, envelope='records')
    def get(self):
        return NOWApplicationReviewType.get_active()
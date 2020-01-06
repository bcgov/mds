from flask import current_app
from flask_restplus import Resource, reqparse, fields, inputs

from app.extensions import api
from app.api.utils.access_decorators import requires_role_edit_permit
from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.now_applications.models.now_application_review import NOWApplicationReview
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.response_models import NOW_APPLICATION_REVIEW_MDOEL


class NOWApplicationReviewResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'now_application_review_type_code', type=str, help='guid of the mine.', required=True)
    parser.add_argument(
        'response_date', type=inputs.datetime_from_iso8601, help='guid of the mine.')
    parser.add_argument('referee_name', type=str, help='guid of the mine.')

    @api.doc(description='Add new Review to Now Application', params={})
    @requires_role_edit_permit
    @api.marshal_with(NOW_APPLICATION_REVIEW_MDOEL, code=201)
    def post(self, application_guid):
        now_application = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application:
            raise NotFound('No now_application found')
        if not now_application.now_application_id:
            raise BadRequest('Now Application not imported, call import endpoint first')

        data = self.parser.parse_args()
        new_review = NOWApplicationReview.create(now_application.now_application,
                                                 data['now_application_review_type_code'],
                                                 data.get('response_date'),
                                                 data.get('referee_name'))

        return new_review, 201

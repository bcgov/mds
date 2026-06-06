from flask_restx import Resource, reqparse
from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin
from app.api.ministry_contacts.models.distribution_list import DistributionList
from app.api.ministry_contacts.response_models import DISTRIBUTION_LIST_MODEL_LIST

class DistributionListListResource(Resource, UserMixin):
    @api.doc(description='Returns a paginated list of Distribution Lists.')
    @api.marshal_with(DISTRIBUTION_LIST_MODEL_LIST, code=200)
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('page', type=int, help='Page number', location='args', store_missing=False)
        parser.add_argument('per_page', type=int, help='Records per page', location='args', store_missing=False)
        args = parser.parse_args()

        page = args.get('page', 1)
        per_page = args.get('per_page', 25)

        return DistributionList.get_all(page=page, per_page=per_page)

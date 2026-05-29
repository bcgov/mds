from flask_restx import Resource
from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT
from app.api.utils.resources_mixins import UserMixin
from app.api.ministry_contacts.models.distribution_list import DistributionList
from app.api.ministry_contacts.response_models import DISTRIBUTION_LIST_MODEL

class DistributionListListResource(Resource, UserMixin):
    @api.doc(description='Returns all Distribution Lists.')
    @api.marshal_with(DISTRIBUTION_LIST_MODEL, code=201, envelope='records')
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    def get(self):
        return DistributionList.get_all()

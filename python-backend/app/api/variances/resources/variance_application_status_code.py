from flask_restplus import Resource
from app.extensions import api

from ..models.variance_application_status_code import VarianceApplicationStatusCode
from ..response_models import VARIANCE_APPLICATION_STATUS_CODE
from ...utils.access_decorators import requires_any_of, VIEW_ALL, EDIT_VARIANCE, MINESPACE_PROPONENT
from ...utils.resources_mixins import UserMixin, ErrorMixin


class VarianceApplicationStatusCodeResource(Resource, UserMixin, ErrorMixin):
    @api.doc(
        description='Get a list of all active variance application status codes.',
        params={})
    @requires_any_of([VIEW_ALL, EDIT_VARIANCE, MINESPACE_PROPONENT])
    @api.marshal_with(VARIANCE_APPLICATION_STATUS_CODE, code=200, envelope='records')
    def get(self):
        return VarianceApplicationStatusCode.active()

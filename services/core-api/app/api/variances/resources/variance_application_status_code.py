from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, EDIT_VARIANCE, MINESPACE_PROPONENT

from app.api.utils.resources_mixins import UserMixin
from app.api.variances.models.variance_application_status_code import VarianceApplicationStatusCode
from app.api.variances.response_models import VARIANCE_APPLICATION_STATUS_CODE


class VarianceApplicationStatusCodeResource(Resource, UserMixin):
    @api.doc(description='Get a list of all active variance application status codes.', params={})
    @requires_any_of([VIEW_ALL, EDIT_VARIANCE, MINESPACE_PROPONENT])
    @api.marshal_with(VARIANCE_APPLICATION_STATUS_CODE, code=200, envelope='records')
    def get(self):
        return VarianceApplicationStatusCode.get_all()

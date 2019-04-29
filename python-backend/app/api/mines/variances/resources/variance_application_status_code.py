from flask_restplus import Resource
from app.extensions import api

from ..models.variance_application_status_code import VarianceApplicationStatusCode
from ....utils.access_decorators import requires_any_of, MINE_VIEW
from ....utils.resources_mixins import UserMixin, ErrorMixin
from app.api.mines.mine_api_models import VARIANCE_APPLICATION_STATUS_CODE_MODEL


class VarianceApplicationStatusCodeResource(Resource, UserMixin, ErrorMixin):
    @api.doc(
        description='Get a list of all active variance application status codes.',
        params={})
    @requires_any_of([MINE_VIEW])
    @api.marshal_with(VARIANCE_APPLICATION_STATUS_CODE_MODEL, code=200, envelope='records')
    def get(self):
        return VarianceApplicationStatusCode.active()

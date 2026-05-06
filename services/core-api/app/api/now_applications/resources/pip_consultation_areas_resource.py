from flask_restx import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all

from app.api.utils.resources_mixins import UserMixin
from app.api.now_applications.models.pip_consultation_area import PIPConsultationArea
from app.api.now_applications.response_models import PIP_CONSULTATION_AREA


class PIPConsultationAreaResource(Resource, UserMixin):
    @api.doc(description='Get a list of all the static PIP data we were given', params={})
    @requires_role_view_all
    @api.marshal_with(PIP_CONSULTATION_AREA, code=200, envelope='records', as_list=True)
    def get(self):
        return PIPConsultationArea.get_all()
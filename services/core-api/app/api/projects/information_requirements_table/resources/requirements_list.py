from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.utils.access_decorators import MINESPACE_PROPONENT, requires_any_of, VIEW_ALL
from app.api.projects.response_models import REQUIREMENTS_MODEL

from app.api.projects.information_requirements_table.models import Requirements
from app.api.utils.resources_mixins import UserMixin


class RequirementsListResource(Resource, UserMixin):
    @api.doc(
        description='Get all active requirements', )
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(REQUIREMENTS_MODEL, code=200, envelope='records')
    def get(self):
        requirements = Requirements.get_all()
        if not requirements:
            raise NotFound('No requirements found.')

        return requirements

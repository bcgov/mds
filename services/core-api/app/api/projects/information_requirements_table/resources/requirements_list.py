from pkg_resources import Requirement
from flask_restx import Resource
from flask import request
from werkzeug.exceptions import BadRequest, NotFound
from marshmallow.exceptions import MarshmallowError

from app.extensions import api
from app.api.utils.access_decorators import MINESPACE_PROPONENT, requires_any_of, VIEW_ALL, requires_role_edit_requirements
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

    @api.doc(description='Create a requirement')
    @requires_role_edit_requirements
    @api.expect(REQUIREMENTS_MODEL)
    @api.marshal_with(REQUIREMENTS_MODEL, code=201)
    def post(self):
        try:
            requirement = Requirements._schema().load(request.json['requirement'])
        except MarshmallowError as e:
            raise BadRequest(e)

        requirement.save()

        return requirement, 201

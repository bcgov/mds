from flask_restx import Resource
from flask import request
from werkzeug.exceptions import BadRequest, NotFound
from marshmallow.exceptions import MarshmallowError

from app.extensions import api, db
from app.api.utils.access_decorators import MINESPACE_PROPONENT, requires_any_of, VIEW_ALL, EDIT_REQUIREMENTS
from app.api.projects.response_models import REQUIREMENTS_MODEL
from app.api.projects.information_requirements_table.models.requirements import Requirements
from app.api.utils.resources_mixins import UserMixin


class RequirementsResource(Resource, UserMixin):
    @api.doc(
        description='Get a Requirement by GUID',
        params={'requirement_guid': 'GUID of the Requirement associated to IRTs'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(REQUIREMENTS_MODEL, code=200)
    def get(self, requirement_guid):
        requirement = Requirements.find_by_requirement_guid(requirement_guid)
        if requirement is None:
            raise NotFound('Requirement not found')

        return requirement

    @api.doc(
        description='Update a requirement.',
        params={'requirement_guid': 'GUID of requirement associated to IRTs'})
    @requires_any_of([MINESPACE_PROPONENT, EDIT_REQUIREMENTS])
    @api.marshal_with(REQUIREMENTS_MODEL, code=200, envelope='records')
    def put(self, requirement_guid):
        old_display_order = None
        old_requirement = Requirements.find_by_requirement_guid(requirement_guid)

        if old_requirement:
            old_display_order = old_requirement.display_order

        try:
            requirement = Requirements._schema().load(
                request.json, instance=Requirements.find_by_requirement_guid(requirement_guid))

        except MarshmallowError as e:
            raise BadRequest(e)

        requirements = []
        if requirement.parent_requirement_id is not None:
            requirements = requirement.parent.sub_requirements
        else:
            requirements = Requirements.get_all()

        if requirements and old_display_order:
            if old_display_order > requirement.display_order:
                requirements = sorted(
                    requirements,
                    key=lambda x:
                    (x.display_order, x.requirement_guid != requirement.requirement_guid))

            for i, req in enumerate(requirements):
                req.display_order = i + 1
                req.save(commit=False)

        db.session.commit()

        return requirement

    @api.doc(
        description='Delete a requirement',
        params={'requirement_guid': 'GUID of requirement to be deleted'})
    @api.expect(REQUIREMENTS_MODEL)
    @requires_any_of([MINESPACE_PROPONENT, EDIT_REQUIREMENTS])
    def delete(self, requirement_guid):
        requirement = Requirements.find_by_requirement_guid(requirement_guid)

        if not requirement:
            raise BadRequest('No requirement found with that guid.')

        requirement.deleted_ind = True
        requirement.save()

        requirements = []
        if requirement.parent_requirement_id is not None:
            requirements = requirement.parent.sub_requirements
        else:
            requirements = Requirements.get_all()

        if requirements:
            for i, requirement in enumerate(sorted(requirements, key=lambda x: x.display_order)):
                requirement.display_order = i + 1
                requirement.save(commit=False)

        db.session.commit()

        return (' ', 204)
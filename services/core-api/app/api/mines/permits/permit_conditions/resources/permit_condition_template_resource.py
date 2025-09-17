from flask_restx import Resource
from werkzeug.exceptions import BadRequest, NotFound

from app.api.mines.permits.permit_conditions.resources.permit_conditions_resource import get_permit_amendment
from app.extensions import api, db
from app.api.mines.permits.permit_conditions.models import StandardPermitConditions, PermitConditions
from app.api.utils.access_decorators import requires_role_edit_permit
from app.api.utils.resources_mixins import UserMixin


class PermitConditionTemplateResource(Resource, UserMixin):
    @api.doc(description='Create a permit condition on the specified permit draft')
    @requires_role_edit_permit
    def post(self, permit_amendment_guid, standard_permit_condition_guid):
        permit_amendment = get_permit_amendment(permit_amendment_guid)

        if permit_amendment.is_generated_in_core and permit_amendment.permit_amendment_status_code != "DFT":
            raise BadRequest('Permit Conditions cannot be edited if the permit was issued in Core and is no longer a draft.')

        standard_permit_condition = StandardPermitConditions.find_by_standard_permit_condition_guid(standard_permit_condition_guid)
        if not standard_permit_condition:
            raise NotFound('No standard permit conditions found with that guid.')

        PermitConditions.copy_from_standard([standard_permit_condition], permit_amendment.permit_amendment_id)
        db.session.commit()
        return (
            {'message': 'Permit conditions successfully copied from standard permit conditions.'},
            201,
            {'Location': str(permit_amendment.permit_amendment_id)},
        )



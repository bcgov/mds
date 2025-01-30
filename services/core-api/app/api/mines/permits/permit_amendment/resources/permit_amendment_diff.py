
from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import (
    PermitAmendment,
)
from app.api.mines.permits.permit_conditions.models.permit_conditions import (
    PermitConditions,
)
from app.api.mines.permits.permit_conditions.services.permit_condition_comparer import (
    PermitConditionComparer,
)
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask import request
from flask_restx import Resource
from werkzeug.exceptions import BadRequest, NotFound

from .response_models import PERMIT_CONDITION_DIFF_LIST_MODEL


def _find_previous_amendment(permit_amendment, all_permit_amendments):
    current_amendment_index = all_permit_amendments.index(permit_amendment)
    previous_amendment = (
        all_permit_amendments[current_amendment_index + 1]
        if current_amendment_index < len(all_permit_amendments) - 1
        else None
    )

    return previous_amendment

class PermitAmendmentDiffResource(Resource, UserMixin):

    @api.response(200, "Returns the diff between the given permit amendment and the previous one")
    @requires_role_view_all
    @api.marshal_with(PERMIT_CONDITION_DIFF_LIST_MODEL, code=200)
    def get(self, mine_guid, permit_guid, permit_amendment_guid):


        mine = Mine.find_by_mine_guid(mine_guid)
        
        if mine is None:
            raise NotFound('Mine')
        
        permit = Permit.find_by_permit_guid(permit_guid, mine_guid=mine_guid)

        if permit is None:
            raise NotFound('Permit')

        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)

        if permit_amendment is None:
            raise NotFound('Permit Amendment')
        
        if str(permit_amendment.permit_guid) != str(permit_guid):
            raise BadRequest("Permit Amendment does not belong to the given permit")

        permit_condition_guid = request.args.get('permit_condition_guid')
        permit_condition = None
        
        if permit_condition_guid is not None:
            permit_condition = PermitConditions.find_by_permit_condition_guid(permit_condition_guid)

            if permit_condition is None:
                raise NotFound('Permit Condition not found')
            
            if str(permit_condition.permit_amendment_id) != str(permit_amendment.permit_amendment_id):
                raise BadRequest("Permit Condition does not belong to the given permit amendment")

        previous_amendment = _find_previous_amendment(permit_amendment, permit_amendment.permit._all_permit_amendments)

        if previous_amendment:
            differ = PermitConditionComparer(previous_amendment.all_conditions)
            comparison = differ.compare_all_conditions([permit_condition] if permit_condition else permit_amendment.all_conditions)

        return {"comparison": [c.to_dict() for c in comparison] if comparison else None}

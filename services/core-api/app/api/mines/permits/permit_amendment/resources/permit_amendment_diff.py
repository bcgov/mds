from datetime import datetime

from app.api.mines.permits.permit_amendment.models.permit_amendment import (
    PermitAmendment,
)
from app.api.mines.permits.permit_conditions.services.permit_condition_comparer import (
    ConditionComparison,
    PermitConditionComparer,
)
from app.api.services.issue_to_orgbook_service import OrgBookIssuerService
from app.api.utils.access_decorators import (
    requires_role_mine_admin,
    requires_role_view_all,
)
from app.api.utils.resources_mixins import UserMixin
from app.extensions import api
from flask import current_app, request
from flask_restx import Resource, reqparse
from werkzeug.exceptions import BadRequest


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
    def get(self, mine_guid, permit_guid, permit_amendment_guid):
        permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)

        previous_amendment = _find_previous_amendment(permit_amendment, permit_amendment.permit._all_permit_amendments)

        if previous_amendment:
            differ = PermitConditionComparer(previous_amendment.all_conditions)
            comparison = differ.compare_all_conditions(permit_amendment.conditions)

        return {"comparison": [c.to_dict() for c in comparison] if comparison else None}

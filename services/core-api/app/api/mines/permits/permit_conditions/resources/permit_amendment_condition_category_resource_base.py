from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import (
    PermitAmendment,
)
from app.api.mines.permits.permit_conditions.models.permit_condition_category import (
    PermitConditionCategory,
)
from werkzeug.exceptions import BadRequest


def validate_permit_amendment_category(mine_guid, permit_guid, permit_amendment_guid, permit_condition_category_code=None):
    mine = Mine.find_by_mine_guid(mine_guid)
    if not mine:
        raise BadRequest('Mine not found.')

    permit = None
    try:
        permit = Permit.find_by_permit_guid(permit_guid, mine_guid)
    except IndexError:
        raise BadRequest('Permit mine_guid and supplied mine_guid mismatch.')    
    
    if not permit:
        raise BadRequest('Permit not found.')            

    permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
    if not permit_amendment:
        raise BadRequest("Permit Amendment not found.")

    if str(permit_amendment.permit_guid) != str(permit_guid):
        raise BadRequest('Permit Amendment permit guid and supplied permit_guid mismatch.')

    if permit_condition_category_code:
        category = PermitConditionCategory.find_by_permit_condition_category_code(permit_condition_category_code)
        if not category:
            raise BadRequest('Permit Condition Category not found.')

        if category.permit_amendment_id != permit_amendment.permit_amendment_id:
            raise BadRequest('Permit category is not associated with this permit amendment.')
    else:
        category = None

    return mine, permit, permit_amendment, category

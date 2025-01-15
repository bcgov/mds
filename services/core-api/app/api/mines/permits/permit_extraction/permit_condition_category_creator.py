import uuid
from typing import Optional

from app.api.mines.permits.permit_amendment.models.permit_amendment import (
    PermitAmendment,
)
from app.api.mines.permits.permit_conditions.models.permit_condition_category import (
    PermitConditionCategory,
)

from .models.permit_condition_result import PermitConditionResult


class PermitConditionCategoryCreator:
    def __init__(self, permit_amendment: PermitAmendment):
        self.permit_amendment = permit_amendment
        self.display_order_counter = 0

    def create_category(self, condition: PermitConditionResult, step: str, increase_display_order=True) -> Optional[str]:
        if increase_display_order:
            self.display_order_counter += 1
        
        text = (
            condition.condition_title
            if condition.condition_title
            else condition.condition_text
        )

        category = PermitConditionCategory.create(
            condition_category_code=str(uuid.uuid4()),
            description=text,
            display_order=self.display_order_counter,
            permit_amendment_id=self.permit_amendment.permit_amendment_id,
            step=step,
        )

        return category
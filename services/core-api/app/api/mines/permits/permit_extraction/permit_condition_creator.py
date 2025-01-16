from typing import Dict, Optional, Tuple

from app.api.mines.permits.permit_amendment.models.permit_amendment import (
    PermitAmendment,
)
from app.api.mines.permits.permit_conditions.models.permit_conditions import (
    PermitConditions,
)
from app.api.mines.permits.permit_conditions.services.permit_condition_comparer import (
    ConditionComparison,
    PermitConditionComparer,
)
from app.extensions import db

from .category_mapper import CategoryMapper
from .models.permit_condition_result import PermitConditionResult


class PermitConditionCreator:
    def __init__(
        self,
        permit_amendment: PermitAmendment,
        previous_amendment: Optional[PermitAmendment],
    ):
        self.permit_amendment = permit_amendment
        self.previous_amendment = previous_amendment
        self.last_condition_id_by_number_structure: Dict[str, str] = {}
        self.display_order_by_parent: Dict[str, int] = {}
        self.current_category = None
        self.default_section = None

    def set_default_section(self, section) -> None:
        self.default_section = section.condition_category_code

    def get_current_category(self) -> Optional[str]:
        return self.current_category or self.default_section

    def get_default_section(self) -> Optional[str]:
        return self.default_section

    def update_category(self, category_code) -> None:
        if category_code:
            self.current_category = category_code.condition_category_code

    def create_condition(
        self,
        condition: PermitConditionResult,
    ) -> Tuple[
        PermitConditions, Optional[PermitConditions], Optional[ConditionComparison]
    ]:
        current_category = self.get_current_category()

        parent = self._determine_parent(condition)
        title_condition = None

        # Create title condition if present
        if condition.condition_title:
            title_condition = self._create_title_condition(
                condition=condition, category_code=current_category, parent=parent
            )
            # Title becomes parent for main condition
            parent = title_condition

        # Create main condition
        display_order = self._get_next_display_order(
            parent.permit_condition_id if parent else None
        )

        condition_type = self._determine_condition_type(condition)

        main_condition = PermitConditions(
            permit_amendment_id=self.permit_amendment.permit_amendment_id,
            condition_category_code=current_category,
            condition_type_code=condition_type,
            condition=condition.condition_text,
            display_order=display_order,
            parent_permit_condition_id=parent.permit_condition_id if parent else None,
            deleted_ind=False,
            meta=condition.meta,
            _step=(condition.step if not condition.condition_title else ""),
        )

        comparison = None

        if self.previous_amendment:
            condition_comparer = PermitConditionComparer(
                previous_amendment_conditions=list(self.previous_amendment.conditions)
            )
            comparison = condition_comparer.compare_condition(main_condition)
            main_condition.meta = main_condition.meta or {}
            main_condition.meta.update({"condition_comparison": comparison.to_dict()})

        db.session.add(main_condition)
        db.session.flush()

        # Update tracking
        number_key = ".".join(condition.numbering_structure)
        self.last_condition_id_by_number_structure[number_key] = (
            main_condition.permit_condition_id
        )

        return main_condition, title_condition, comparison

    def _create_title_condition(
        self,
        condition: PermitConditionResult,
        category_code: Optional[str],
        parent: Optional[PermitConditions],
    ) -> PermitConditions:
        display_order = self._get_next_display_order(
            parent.permit_condition_id if parent else None
        )

        title_condition = PermitConditions(
            permit_amendment_id=self.permit_amendment.permit_amendment_id,
            condition_category_code=category_code,
            condition_type_code=self._determine_condition_type(condition),
            condition=condition.condition_title,
            display_order=display_order,
            parent_permit_condition_id=parent.permit_condition_id if parent else None,
            deleted_ind=False,
            meta=condition.meta,
            _step=condition.step,
        )

        db.session.add(title_condition)
        db.session.flush()
        return title_condition

    def _determine_condition_type(self, condition: PermitConditionResult) -> str:
        type_code = CategoryMapper.map_indentation_to_type(condition)
        return type_code

    def _determine_parent(
        self, condition: PermitConditionResult
    ) -> Optional[PermitConditions]:
        number_structure = condition.numbering_structure
        parent_number_structure = [item for item in number_structure if item][:-1]

        if len(parent_number_structure) < len(number_structure):
            parent_number_structure += [""] * (
                len(number_structure) - len(parent_number_structure)
            )

        parent_key = ".".join(parent_number_structure)
        parent_id = self.last_condition_id_by_number_structure.get(parent_key)

        if parent_id:
            return db.session.query(PermitConditions).get(parent_id)
        return None

    def _get_next_display_order(self, parent_id: Optional[str]) -> int:
        current = self.display_order_by_parent.get(parent_id, 0) + 1
        self.display_order_by_parent[parent_id] = current
        return current

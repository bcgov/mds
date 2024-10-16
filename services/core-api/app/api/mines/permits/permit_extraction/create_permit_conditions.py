import uuid
from difflib import SequenceMatcher
from typing import List, Optional

from app.api.mines.permits.permit_conditions.models.permit_condition_category import (
    PermitConditionCategory,
)
from app.api.mines.permits.permit_conditions.models.permit_conditions import (
    PermitConditions,
)
from app.api.mines.permits.permit_extraction.models.permit_extraction_task import (
    PermitExtractionTask,
)
from app.extensions import db

from .models.permit_condition_result import (
    CreatePermitConditionsResult,
    PermitConditionResult,
)

indentation_type_code_mapping = {
    0: None,
    1: 'SEC',
    2: 'CON',
    3: 'LIS',
    4: 'LIS',
    5: 'LIS',
}

# For conditions that don't match any category, put them in the "General" category
DEFAULT_CATEGORY = 'GEC'

def create_permit_conditions_from_task(task: PermitExtractionTask):
    """
    Create permit conditions from the task result.
    """
    result = task.task_result
    last_condition_id_by_hierarchy = {}
    condition_categories = PermitConditionCategory.get_all()
    current_category = None

    result = CreatePermitConditionsResult.model_validate(result)

    has_category = any([condition.is_top_level_section and bool(_map_condition_to_category(condition_categories, condition)) for condition in result.conditions])

    conditions = result.conditions
    if not has_category:
        top_level_section = PermitConditionResult(
            section='A',
            condition_text='General'
        )
        for c in conditions:
            c.set_section(top_level_section)
        conditions = [top_level_section] + conditions

    for idx, condition in enumerate(conditions):
        
        if condition.is_top_level_section:        
            section_category = _map_condition_to_category(condition_categories, condition)

            if section_category:
                current_category = section_category
        else:            
            parent = _determine_parent(condition, last_condition_id_by_hierarchy)
            type_code = _map_condition_to_type_code(condition)

            title_cond = None

            category_code = current_category or DEFAULT_CATEGORY
            if condition.condition_title:
                title_cond = _create_title_condition(task, category_code, condition, parent, idx, type_code)

            parent_condition_id = _get_parent_condition_id(title_cond, parent)
            cond = _create_permit_condition(task, category_code, condition, parent_condition_id, idx, type_code)

            hierarchy_key = ".".join(condition.numbering_structure)
            last_condition_id_by_hierarchy[hierarchy_key] = cond
    db.session.commit()

    

def _map_condition_to_type_code(condition: PermitConditionResult):
    """
    The type code is based on the indentation level of the condition
    Example: ['A', '1', 'a', 'i', ''] would have an indentation of 4 -> type code is 'LIS'
    Example: ['A', '1', '', '', ''] would have an indentation of 2 -> type code is 'CON'
    Example: ['A', '', '', '', ''] would have an indentation of 1 -> type code is 'SEC'
    """
    indentation = next((i-1 for i, x in enumerate(condition.numbering_structure) if x == ''), 0)
    type_code = indentation_type_code_mapping[indentation]
    return type_code

def _create_title_condition(task, current_category, condition, parent, idx, type_code) -> PermitConditionResult:
    condition = PermitConditions(
        permit_amendment_id=task.permit_amendment.permit_amendment_id,
        permit_condition_guid=uuid.uuid4(),
        condition_category_code=current_category,
        condition=condition.condition_title,
        condition_type_code=type_code,
        parent_permit_condition_id=parent.permit_condition_id if parent else None,
        display_order=idx,
        _step=condition.step,
    )

    db.session.add(condition)
    db.session.flush()  # This assigns an ID to title_cond without committing the transaction
    return condition

def _get_parent_condition_id(title_cond: PermitConditionResult, parent: PermitConditionResult) -> Optional[str]:
    if title_cond:
        # If the condition has a title, the parent is the title condition
        return title_cond.permit_condition_id
    elif parent:
        return parent.permit_condition_id
    else:
        return None

def _create_permit_condition(task, current_category, condition, parent_condition_id, idx, type_code) -> PermitConditions:
    condition = PermitConditions(
        permit_amendment_id=task.permit_amendment.permit_amendment_id,
        permit_condition_guid=uuid.uuid4(),
        condition_category_code=current_category,
        condition=condition.condition_text,
        condition_type_code=type_code,
        parent_permit_condition_id=parent_condition_id,
        display_order=idx,
        _step=condition.step if not condition.condition_title else '', # If the condition has a title, the parent is the title condition, which has the numbering associated with it already
    )
    db.session.add(condition)
    db.session.flush()  # This assigns an ID to cond without committing the transaction

    return condition


def _determine_parent(condition: PermitConditionResult, last_condition_id_by_number_structure) -> Optional[PermitConditionResult]:
    """
    Determine the parent ID based on the hierarchy.

    Example:
    - If the hierarchy is ['A', '1', 'a', 'i', ''], the parent is the condition with the hierarchy ['A', '1', 'a', '', '']
    """
    number_structure = condition.numbering_structure
    parent_number_structure = [item for item in number_structure if item][:-1]

    if len(parent_number_structure) < len(number_structure):
        parent_number_structure += [''] * (len(number_structure) - len(parent_number_structure))

    parent_key = ".".join(parent_number_structure)

    parent = last_condition_id_by_number_structure.get(parent_key)
    return parent

def _map_condition_to_category(condition_categories: List[PermitConditionCategory], condition: PermitConditionResult) -> Optional[str]:
    """
    Finds the matching PermitConditionCategory code for the given condition based on the title or text it contains.

    If the condition title or text contains the category description (with a >0.6 ratio), it is considered a match

    TODO:
        - This is just in place to get something working that will map Major Mine categories to existing
            regional mine permit categories. This will need to be updated to be more robust and flexible.
        - The 0.6 ratio is just to cover cases where the condition text is not an exact match to the category description.
            For example this will map the "Protection of Land and Watercourses" Major Mine category to the existing "Environmental Land and Watercourses" category.

    Args:
        condition_categories: List of PermitConditionCategory objects
        condition: Condition object
        
    """
    for cat in condition_categories:
        desc = cat.description.lower().replace('conditions', '')
        text = condition.condition_title if condition.condition_title else condition.condition_text
        text = text.lower().replace('conditions', '')

        if SequenceMatcher(None, desc, text).ratio() > 0.6:
            return cat.condition_category_code
    return None

    

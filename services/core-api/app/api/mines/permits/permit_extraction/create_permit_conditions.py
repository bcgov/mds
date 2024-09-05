import uuid
from difflib import SequenceMatcher

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

indentation_type_code_mapping = {
    0: None,
    1: 'SEC',
    2: 'CON',
    3: 'LIS',
    4: 'LIS',
    5: 'LIS',
}

def create_permit_conditions_from_task(task: PermitExtractionTask):
    """
    Create permit conditions from the task result.
    """
    result = task.task_result
    last_condition_id_by_hierarchy = {}
    condition_categories = PermitConditionCategory.get_all()
    
    current_category = None
    for idx, condition in enumerate(result['conditions']):
        condition_numbering_structure = [
            condition.get('section', '') or '',
            condition.get('paragraph', '') or '',
            condition.get('subparagraph', '') or '',
            condition.get('clause', '') or '',
            condition.get('subclause', '') or '',
            condition.get('subsubclause', '') or '',
        ]

        

        if is_condition_toplevel_section(condition):        
            section_category = map_condition_to_category(condition_categories, condition)

            if section_category:
                current_category = section_category
        else:            
            parent = determine_parent(condition_numbering_structure, last_condition_id_by_hierarchy)
            step = find_numbering_for_condition(condition_numbering_structure)
            title_cond = None
            indentation = next((i for i, x in enumerate(condition_numbering_structure) if x), 0)
            type_code = indentation_type_code_mapping[indentation]

            if condition.get('condition_title'):
                title_cond = PermitConditions(
                    permit_amendment_id=task.permit_amendment.permit_amendment_id,
                    permit_condition_guid=uuid.uuid4(),
                    condition_category_code=current_category,
                    condition=condition['condition_title'],
                    condition_type_code=type_code,
                    parent_permit_condition_id=parent.permit_condition_id if parent else None,
                    display_order=idx,
                    _step=step,
                )
                db.session.add(title_cond)
                db.session.flush()  # This assigns an ID to title_cond without committing the transaction


            parent_condition_id = title_cond.permit_condition_id if title_cond else parent.permit_condition_id if parent else None

            cond = PermitConditions(
                permit_amendment_id=task.permit_amendment.permit_amendment_id,
                permit_condition_guid=uuid.uuid4(),
                condition_category_code=current_category,
                condition=condition['condition_text'],
                condition_type_code=type_code,
                parent_permit_condition_id=parent_condition_id,
                display_order=idx,
                _step=step if not condition.get('condition_title') else ' ',
            )
            db.session.add(cond)
            db.session.flush()  # This assigns an ID to cond without committing the transaction

            hierarchy_key = ".".join(condition_numbering_structure)
            last_condition_id_by_hierarchy[hierarchy_key] = cond
    db.session.commit()

def determine_parent(hierarchy, last_condition_id_by_hierarchy):
    """
    Determine the parent ID based on the hierarchy.
    """
    parent_hierarchy = [item for item in hierarchy if item][:-1]

    if len(parent_hierarchy) < len(hierarchy):
        parent_hierarchy += [''] * (len(hierarchy) - len(parent_hierarchy))

    parent_key = ".".join(parent_hierarchy)

    parent = last_condition_id_by_hierarchy.get(parent_key)
    return parent


def find_numbering_for_condition(hierarchy):
    return next(cond for cond in reversed(hierarchy) if cond and cond != '')

def map_condition_to_category(condition_categories, condition):
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
        text = condition.get('condition_title') if condition.get('condition_title') else condition.get('condition_text')
        text = text.lower().replace('conditions', '')

        if SequenceMatcher(None, desc, text).ratio() > 0.6:
            return cat.condition_category_code
    return None

def is_condition_toplevel_section(r):
    return r.get('section') and not r.get('paragraph') and not r.get('subparagraph') and not r.get('clause') and not r.get('subclause') and not r.get('subsubclause')

    

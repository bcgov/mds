
from app.api.mines.permits.permit_extraction.models.permit_extraction_task import (
    PermitExtractionTask,
)
from app.extensions import db
from flask import current_app

from .category_mapper import CategoryMapper
from .create_permit_condition_report_requirement import (
    create_or_copy_permit_condition_report_requirements,
)
from .models.permit_condition_result import (
    CreatePermitConditionsResult,
    PermitConditionResult,
)
from .permit_condition_category_creator import PermitConditionCategoryCreator
from .permit_condition_creator import PermitConditionCreator
from app.api.mines.reports.models.mine_report_permit_requirement import (
    MineReportPermitRequirement,
)
from app.api.mines.permits.permit_conditions.models.permit_condition_category import (
    PermitConditionCategory,
)
from app.api.mines.permits.permit_conditions.models.permit_conditions import PermitConditions


def create_permit_conditions_from_task(task: PermitExtractionTask):
    result = task.task_result
    try:
        result = CreatePermitConditionsResult.model_validate(result)
        category_creator = PermitConditionCategoryCreator(task.permit_amendment)

        previous_amendment = _find_previous_amendment(
            task.permit_amendment, task.permit_amendment.permit._all_permit_amendments
        )

        condition_creator = PermitConditionCreator(
            task.permit_amendment, previous_amendment
        )

        conditions = _add_toplevel_category_if_missing(result)

        created_cond = []
        comparisons = []
        for condition in conditions:
            if condition.is_top_level_section:
                _create_top_level_category(
                    condition_creator, category_creator, condition
                )
            else:
                if not condition_creator.get_current_category():
                    _create_default_category(condition_creator, category_creator)

                # Create the condition
                main_cond, title_cond, created_comparisons = condition_creator.create_condition(
                    condition=condition,
                )
                comparisons = comparisons + created_comparisons
                if title_cond:
                    created_cond.append(title_cond)
                
                created_cond.append(main_cond)

        comparison_by_id = {}

        comparison_by_id = {comp.current_condition.permit_condition_id: comp for comp in comparisons}


        for condition in created_cond:
            _add_report_name_if_missing(condition)
            comparison = comparison_by_id.get(condition.permit_condition_id)
            parent_mine_report = MineReportPermitRequirement.find_by_permit_condition_id(condition.parent_permit_condition_id)
            is_duplicate_of_parent_report = False
            report_requirement = None

            if parent_mine_report:
                meta = condition.meta or {}
                questions = meta.get("questions", [])
                condition_report_name = next((q for q in questions if (q and q["question_key"] == "report_name")), None)
                if condition_report_name:
                    is_duplicate_of_parent_report = parent_mine_report.report_name == condition_report_name['answer']
            
            if not is_duplicate_of_parent_report:
                report_requirement = create_or_copy_permit_condition_report_requirements(task, condition, comparison)
            if report_requirement:
                db.session.add(report_requirement)

            _update_condition_approval_status(condition, comparison_by_id)

        db.session.commit()

        return True

    except Exception as e:
        current_app.logger.error("Failed to create permit conditions from task")
        current_app.logger.error(e)
        db.session.rollback()
        raise e


def _update_condition_approval_status(condition, comparison_by_id):
    """
    - Update the approval status of the top level conditions if it is unchanged since the previous amendment
    """
    comparison = comparison_by_id.get(condition.permit_condition_id)

    if comparison:
        if not condition.parent_permit_condition_id and condition.is_unchanged:
            condition.permit_condition_status_code = comparison.previous_condition.permit_condition_status_code


def _find_previous_amendment(permit_amendment, all_permit_amendments):
    current_amendment_index = all_permit_amendments.index(permit_amendment)
    previous_amendment = (
        all_permit_amendments[current_amendment_index + 1]
        if current_amendment_index < len(all_permit_amendments) - 1
        else None
    )

    return previous_amendment


def _create_default_category(condition_creator, category_creator):
    default_section = category_creator.create_category(
        condition=PermitConditionResult(
            section="A",
            condition_text=CategoryMapper.DEFAULT_CATEGORY,
        ),
        step="A",
        increase_display_order=False,
    )

    condition_creator.set_default_section(default_section)
    condition_creator.update_category(default_section)


def _create_top_level_category(condition_creator, category_creator, condition):
    section_category = category_creator.create_category(condition, condition.step)
    if condition.condition_text == CategoryMapper.DEFAULT_CATEGORY:
        condition_creator.set_default_section(section_category)
    condition_creator.update_category(section_category)


def _add_toplevel_category_if_missing(result):
    has_category = any(
        [condition.is_top_level_section for condition in result.conditions]
    )
    conditions = result.conditions

    if not has_category:
        top_level_section = PermitConditionResult(
            section="A", condition_text=CategoryMapper.DEFAULT_CATEGORY
        )

        for c in conditions:
            c.set_section(top_level_section)
        conditions = [top_level_section] + conditions
    return conditions

def _add_report_name_if_missing(condition):
    if condition.meta and condition.meta.get("questions", None):
        report_name_question = next((q for q in condition.meta["questions"] if (q and q["question_key"] == "report_name")), None)
        if report_name_question and report_name_question["answer"] == None:
            condition_category = PermitConditionCategory.find_by_permit_condition_category_code(condition.condition_category_code)
            category_text = condition_category.description
            section_text = ""
            current_condition_level = condition
            while current_condition_level:
                if current_condition_level._step != '':
                    section_text = f"{current_condition_level._step}{'.' if section_text != '' else ''}{section_text}"
                if current_condition_level and current_condition_level.parent_permit_condition_id:
                    current_condition_level = PermitConditions.find_by_permit_condition_id(current_condition_level.parent_permit_condition_id)
                else:
                    break
            report_name_question["answer"] = f"{category_text} - {section_text}"

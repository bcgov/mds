from app.api.mines.permits.permit_extraction.models.permit_extraction_task import (
    PermitExtractionTask,
)
from app.extensions import db

from .category_mapper import CategoryMapper
from .create_permit_condition_report_requirement import (
    create_permit_condition_report_requirement,
)
from .models.permit_condition_result import (
    CreatePermitConditionsResult,
    PermitConditionResult,
)
from .permit_condition_category_creator import PermitConditionCategoryCreator
from .permit_condition_creator import PermitConditionCreator


def create_permit_conditions_from_task(task: PermitExtractionTask):
    result = task.task_result
    try:
        result = CreatePermitConditionsResult.model_validate(result)
        condition_creator = PermitConditionCreator(task.permit_amendment, db.session)
        category_creator = PermitConditionCategoryCreator(task.permit_amendment)

        conditions = add_toplevel_category_if_missing(result)

        for condition in conditions:
            if condition.is_top_level_section:
                _create_top_level_category(
                    condition_creator, category_creator, condition
                )
            else:
                if not condition_creator.get_current_category():
                    _create_default_category(condition_creator, category_creator)

                main_condition, title_condition = condition_creator.create_condition(
                    condition=condition,
                )

                report_requirement = create_permit_condition_report_requirement(
                    task, condition, main_condition.permit_condition_id
                )

                if report_requirement:
                    db.session.add(report_requirement)
                    db.session.flush()
        db.session.commit()
        return True

    except Exception as e:
        db.session.rollback()
        raise e


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


def add_toplevel_category_if_missing(result):
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

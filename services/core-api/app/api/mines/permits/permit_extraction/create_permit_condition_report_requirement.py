from typing import Optional
from datetime import date

from app.api.mines.permits.permit_conditions.models.permit_conditions import (
    PermitConditions,
)
from app.api.mines.reports.models.mine_report_permit_requirement import (
    CimOrCpo,
    MineReportPermitRequirement,
)
from app.api.mines.reports.models.mine_report_req_permit_condition_xref import MineReportReqPermitConditionXref
from dateutil.parser import parse
from flask import current_app

from ..permit_conditions.services.permit_condition_comparer import ConditionChangeType
from .models.permit_condition_result import PermitConditionResult


def create_permit_condition_report_requirement(
    task, condition: PermitConditions
) -> Optional[MineReportPermitRequirement]:
    """
    Creates a MineReportPermitRequirement based on permit condition details.
    Args:
        task: Task object containing permit amendment information
        condition (PermitConditionResult): Permit condition details
        condition_id: ID of the permit condition
    Returns:
        MineReportPermitRequirement: Created requirement object, or None if report not required
    """

    meta = condition.meta or {}
    questions = meta.get("questions", [])

    require_report = False
    recurring = False
    frequency = None
    mention_chief_inspector = False
    mention_chief_permitting_officer = False
    initial_due_date = None
    report_name = None

    for q in questions:
        key = q.get("question_key")
        answer = q.get("answer")
        if key == "require_report":
            require_report = answer
        elif key == "due_date":
            initial_due_date = answer  # Parse date if necessary
        elif key == "recurring":
            recurring = answer
        elif key == "frequency":
            frequency = answer
        elif key == "mention_chief_inspector":
            mention_chief_inspector = answer
        elif key == "mention_chief_permitting_officer":
            mention_chief_permitting_officer = answer
        elif key == "report_name":
            report_name = answer

    if not require_report:
        return None

    initial_due_date = _parse_initial_due_date(condition.permit_condition_id, initial_due_date)

    # Determine cim_or_cpo based on mentions
    cim_or_cpo = _parse_cim_cpo(
        mention_chief_inspector, mention_chief_permitting_officer
    )

    # Calculate due_date_period_months based on frequency
    due_date_period_months = _parse_due_date_period(recurring, frequency)

    # Create the MineReportPermitRequirement
    mine_report_permit_requirement = MineReportPermitRequirement(
        report_name=report_name,
        permit_amendment_id=task.permit_amendment.permit_amendment_id,
        cim_or_cpo=cim_or_cpo,
        due_date_period_months=due_date_period_months or 0,
        initial_due_date=initial_due_date,
        ministry_recipient=None,  # Not specified in permits themselves.
    )
    xref = MineReportReqPermitConditionXref(
        mine_report_permit_requirement=mine_report_permit_requirement,
        permit_condition_id=condition.permit_condition_id
    )
    mine_report_permit_requirement.mine_report_req_permit_conditions.append(xref)

    return mine_report_permit_requirement


def _parse_due_date_period(recurring, frequency):
    due_date_period_months = None
    if recurring and frequency:
        frequency_mapping = {
            "monthly": 1,
            "per month": 1,
            "every month": 1,
            "quarterly": 3,
            "every quarter": 3,
            "semiannually": 6,
            "semiannual": 6,
            "every six months": 6,
            "twice yearly": 6,
            "annually": 12,
            "yearly": 12,
            "annual": 12,
            "per year": 12,
            "every year": 12,
            "biannually": 24,
            "biannual": 24,
            "asneeded": 0,
            "as needed": 0,
            "as required": 0,
            "5 years": 60,
            "every 5 years": 60,
            "five years": 60,
            "every five years": 60,
        }
        # Clean frequency string by removing spaces and special characters before lookup
        frequency = "".join(
            e for e in frequency.lower() if e.isalnum() or e.isspace()
        ).strip()
        frequency = " ".join(frequency.split())
        due_date_period_months = frequency_mapping.get(frequency)
    return due_date_period_months


def _parse_cim_cpo(mention_chief_inspector, mention_chief_permitting_officer) -> CimOrCpo | None:
    cim_or_cpo = None
    if mention_chief_inspector and mention_chief_permitting_officer:
        cim_or_cpo = CimOrCpo.Both
    elif mention_chief_inspector:
        cim_or_cpo = CimOrCpo.CIM
    elif mention_chief_permitting_officer:
        cim_or_cpo = CimOrCpo.CPO
    return cim_or_cpo


def _parse_initial_due_date(condition_id, initial_due_date) -> Optional[date]:
    if initial_due_date == "":
        initial_due_date = None

    if initial_due_date:
        try:
            initial_due_date = parse(initial_due_date)
        except ValueError:
            current_app.logger.error(
                f"Could not parse due date for condition {condition_id}: {initial_due_date}"
            )
            initial_due_date = None
    return initial_due_date


def create_or_copy_permit_condition_report_requirements(
    task, condition, comparison
):
    if (
        comparison
        and comparison.previous_condition
        and comparison.change_type
        in [ConditionChangeType.MODIFIED, ConditionChangeType.MOVED, ConditionChangeType.UNCHANGED]
    ):

        # Copy existing report requirements from previous condition
        existing_requirements = MineReportPermitRequirement.find_by_permit_condition_id(
            comparison.previous_condition.permit_condition_id
        )

        if existing_requirements:
            existing_requirements.update_permit_conditions(
                [comparison.previous_condition.permit_condition_id, 
                 condition.permit_condition_id]
            )
            return existing_requirements
    # No match found, create new requirement
    return create_permit_condition_report_requirement(task, condition)

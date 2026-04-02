# report_helpers.py
import uuid

from app.api.mines.mine.models.mine import Mine
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.permits.permit_amendment.models.permit_amendment import (
    PermitAmendment,
)
from app.api.mines.permits.permit_conditions.models.permit_condition_category import (
    PermitConditionCategory,
)
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_category import MineReportCategory
from app.api.mines.reports.models.mine_report_category_xref import (
    MineReportCategoryXref,
)
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from app.api.mines.reports.models.mine_report_permit_requirement import (
    MineReportPermitRequirement,
)
from app.extensions import db
from sqlalchemy import and_, asc, case, desc, func, or_
from sqlalchemy_filters import apply_filters, apply_pagination, apply_sort


def is_guid(value) -> bool:
    try:
        uuid.UUID(value)
        return True
    except (ValueError, TypeError):
        return False

class ReportFilterHelper:
    @classmethod
    def build_filter(cls, model, field, op, argfield):
        return {'model': model, 'field': field, 'op': op, 'value': argfield}

    @staticmethod
    def _filter_latest_permit_amendment_prr(query):
        latest_amendments = (
            db.session.query(
                PermitAmendment.permit_id.label('permit_id'),
                func.max(PermitAmendment.issue_date).label('latest_issue_date'),
            )
            .filter(
                PermitAmendment.deleted_ind == False,
                PermitAmendment.permit_amendment_status_code != 'DFT',
            )
            .group_by(PermitAmendment.permit_id)
            .subquery()
        )

        latest_amendment_ids = (
            db.session.query(
                PermitAmendment.permit_amendment_id.label('latest_permit_amendment_id'),
                PermitAmendment.permit_id.label('permit_id'),
            )
            .join(
                latest_amendments,
                and_(
                    PermitAmendment.permit_id == latest_amendments.c.permit_id,
                    PermitAmendment.issue_date == latest_amendments.c.latest_issue_date,
                )
            )
            .filter(
                PermitAmendment.deleted_ind == False,
                PermitAmendment.permit_amendment_status_code != 'DFT',
            )
            .subquery()
        )

        filtered_query = (
            query
                .outerjoin(MineReport.mine_report_permit_requirement)
                .outerjoin(MineReport.permit_condition_category)
                .outerjoin(latest_amendment_ids, MineReport.permit_id == latest_amendment_ids.c.permit_id)
        )

        return filtered_query.filter(
            or_(
                MineReport.mine_report_definition_id.isnot(None),
                MineReport.mine_report_status_code != 'NON',
                MineReportPermitRequirement.permit_amendment_id == latest_amendment_ids.c.latest_permit_amendment_id,
                PermitConditionCategory.permit_amendment_id == latest_amendment_ids.c.latest_permit_amendment_id,
                PermitConditionCategory.permit_amendment_id.is_(None),
            )
        )

    @staticmethod
    def _get_alg_permit_amendment_ids(permit_guid=None):
        """
        Get permit_amendment_ids from ALG permits (latest amendment by issue_date).
        Only returns amendments from permits where the latest amendment is type ALG.
        """
        # Subquery: latest issue_date per permit
        latest_issue_date_subq = (
            db.session.query(
                PermitAmendment.permit_id,
                func.max(PermitAmendment.issue_date).label('max_issue_date'),
            )
            .filter(
                PermitAmendment.deleted_ind == False,
                PermitAmendment.permit_amendment_status_code != 'DFT',
            )
            .group_by(PermitAmendment.permit_id)
            .subquery()
        )

        # Get permits where latest amendment is ALG
        alg_permit_ids_subq = (
            db.session.query(PermitAmendment.permit_id)
            .join(latest_issue_date_subq, and_(
                PermitAmendment.permit_id == latest_issue_date_subq.c.permit_id,
                PermitAmendment.issue_date == latest_issue_date_subq.c.max_issue_date,
            ))
            .filter(
                PermitAmendment.deleted_ind == False,
                PermitAmendment.permit_amendment_type_code == 'ALG',
            )
            .subquery()
        )

        # Get the latest amendment ID per (permit_id, mine_guid) for ALG permits
        latest_per_mine_subq = (
            db.session.query(
                PermitAmendment.permit_id,
                PermitAmendment.mine_guid,
                func.max(PermitAmendment.issue_date).label('max_issue_date'),
            )
            .filter(
                PermitAmendment.permit_id.in_(alg_permit_ids_subq),
                PermitAmendment.deleted_ind == False,
                PermitAmendment.permit_amendment_status_code != 'DFT',
            )
            .group_by(PermitAmendment.permit_id, PermitAmendment.mine_guid)
            .subquery()
        )

        query = (
            db.session.query(PermitAmendment.permit_amendment_id)
            .join(latest_per_mine_subq, and_(
                PermitAmendment.permit_id == latest_per_mine_subq.c.permit_id,
                PermitAmendment.mine_guid == latest_per_mine_subq.c.mine_guid,
                PermitAmendment.issue_date == latest_per_mine_subq.c.max_issue_date,
            ))
            .filter(PermitAmendment.deleted_ind == False)
        )

        if permit_guid:
            permit = Permit.find_by_permit_guid(permit_guid)
            if not permit:
                return None
            query = query.filter(PermitAmendment.permit_id == permit.permit_id)

        return query.subquery()

    @staticmethod
    def get_filtered_requirements(current_date, permit_guid=None):
        """
        Get active PRR requirements from ALG permits only.
        Returns the latest amendment's requirements per (permit_id, mine_guid).
        """
        alg_amendment_ids = ReportFilterHelper._get_alg_permit_amendment_ids(permit_guid)
        if alg_amendment_ids is None:
            return [], {'status': 'error', 'reason': 'permit not found'}

        valid_pa = MineReportPermitRequirement.permit_amendment_is_validated()

        requirements = (
            MineReportPermitRequirement.query
            .filter_by(deleted_ind=False, active_ind=True)
            .filter(valid_pa)
            .filter(MineReportPermitRequirement.initial_due_date.isnot(None))
            .filter(MineReportPermitRequirement.permit_amendment_id.in_(alg_amendment_ids))
            .filter(
                or_(
                    MineReportPermitRequirement.due_date_period_months > 0,  # recurring
                    and_(  # single reports with future due date
                        MineReportPermitRequirement.due_date_period_months == 0,
                        MineReportPermitRequirement.initial_due_date >= current_date,
                    )
                )
            )
            .all()
        )

        return requirements, None

    @staticmethod
    def apply_filters_and_pagination(query, args, mine_guid=None):
        sort_models = {
            "mine_report_id": 'MineReport',
            "mine_report_category": 'MineReportCategoryXref',
            "report_name": 'MineReportDefinition',
            "due_date": 'MineReport',
            "received_date": 'MineReport',
            "submission_year": 'MineReport',
            "mine_report_status_code": 'MineReportSubmissionStatusCode',
            "mine_report_status": 'MineReportSubmissionStatusCode',
            "created_by_idir": 'MineReport',
            "mine_name": 'Mine',
            "permit_number": 'MineReport',
        }

        sort_field = {
            "mine_report_id": 'mine_report_id',
            "mine_report_category": 'mine_report_category',
            "report_name": 'report_name',
            "due_date": 'due_date',
            "received_date": 'received_date',
            "submission_year": 'submission_year',
            "mine_report_status_code": 'mine_report_status_description',
            "mine_report_status": 'mine_report_status_description',
            "created_by_idir": 'created_by_idir',
            "mine_name": 'mine_name',
            "permit_number": 'permit_number',
        }

        conditions = []

        if args["search_terms"] or args["major"] or args["region"] or (
                args["sort_field"] and sort_models[args['sort_field']] == 'Mine'):
            query = query.join(Mine)

        if args["report_type"] or (args['sort_field'] and sort_models[
            args['sort_field']] in ['MineReportCategoryXref', 'MineReportDefinition'] and not mine_guid):
            query = query.outerjoin(
                MineReportDefinition, MineReport.mine_report_definition_id ==
                                      MineReportDefinition.mine_report_definition_id)
            query = query.outerjoin(
                MineReportCategoryXref, MineReportDefinition.mine_report_definition_id ==
                                        MineReportCategoryXref.mine_report_definition_id)
            query = query.outerjoin(
                MineReportCategory, MineReportCategoryXref.mine_report_category ==
                                    MineReportCategory.mine_report_category)

        if args["major"]:
            conditions.append(ReportFilterHelper.build_filter('Mine', 'major_mine_ind', '==', args["major"]))

        if args["region"]:
            conditions.append(ReportFilterHelper.build_filter('Mine', 'mine_region', 'in', args["region"]))

        if args["report_type"]:
            query = query.filter(
                or_(
                    MineReportCategoryXref.mine_report_category.in_(args["report_type"]),
                    MineReport.permit_condition_category_code.in_(args["report_type"])
                )
            )

        if args["report_name"]:
            report_name = args["report_name"][0]
            if is_guid(report_name):
                conditions.append(
                    ReportFilterHelper.build_filter('MineReportDefinition', 'mine_report_definition_guid', 'in',
                                                    args["report_name"]))
            else:
                conditions.append(
                    ReportFilterHelper.build_filter('MineReportPermitRequirement', 'mine_report_permit_requirement_id', 'in',
                                                    args["report_name"]))

        if args["status"]:
            query = query.filter(MineReport.mine_report_status_code.in_(args["status"]))

        if args["compliance_year"]:
            conditions.append(
                ReportFilterHelper.build_filter('MineReport', 'submission_year', '==', args["compliance_year"]))

        if args["due_date_before"]:
            conditions.append(
                ReportFilterHelper.build_filter('MineReport', 'due_date', '<=', args["due_date_before"]))

        if args["due_date_after"]:
            conditions.append(
                ReportFilterHelper.build_filter('MineReport', 'due_date', '>=', args["due_date_after"]))

        if args["received_date_before"]:
            conditions.append(
                ReportFilterHelper.build_filter('MineReport', 'received_date', '<=',
                                                args["received_date_before"]))

        if args["received_date_after"]:
            conditions.append(
                ReportFilterHelper.build_filter('MineReport', 'received_date', '>=',
                                                args["received_date_after"]))

        if args["received_only"]:
            query = query.filter(MineReport.received_date.isnot(None))

        if args["requested_by"]:
            conditions.append(
                ReportFilterHelper.build_filter('MineReport', 'created_by_idir', 'ilike',
                                                '%{}%'.format(args["requested_by"])))

        if args["search_terms"]:
            search_conditions = [
                ReportFilterHelper.build_filter('Mine', 'mine_name', 'ilike',
                                                '%{}%'.format(args["search_terms"])),
                ReportFilterHelper.build_filter('Mine', 'mine_no', 'ilike', '%{}%'.format(args["search_terms"])),
            ]
            conditions.append({'or': search_conditions})

        if mine_guid:
            query = query.filter(MineReport.mine_guid == mine_guid)

        if args.get('permit_guid'):
            query = query.filter(MineReport.permit_guid == args["permit_guid"])

        query = ReportFilterHelper._filter_latest_permit_amendment_prr(query)

        if args.get('is_upcoming_view'):
            from datetime import date
            upcoming_window_end = args.get('upcoming_window_end', date.today())
            query = query.filter(
                or_(
                    MineReport.is_overdue == True,
                    and_(
                        MineReport.due_date >= date.today(),
                        MineReport.due_date <= upcoming_window_end,
                        MineReport.mine_report_status_code == 'NON'
                    )
                )
            )

        filtered_query = apply_filters(query, conditions)

        if args.get('sort_overdue'):
            filtered_query = filtered_query.order_by(desc(MineReport.is_overdue))

        if args['sort_field'] == 'mine_report_status_code' or args['sort_field'] == 'mine_report_status':
            if args['sort_dir'] == 'asc':
                filtered_query = filtered_query.order_by(
                    asc(MineReport.mine_report_status_description))
            else:
                filtered_query = filtered_query.order_by(
                    desc(MineReport.mine_report_status_description))
        elif args['sort_field'] == 'report_name':
            filtered_query = (
                filtered_query
                .outerjoin(MineReport.mine_report_definition)
                .outerjoin(MineReport.permit_condition_category)
                .outerjoin(MineReport.mine_report_permit_requirement)
            )
            order_clause = case(
                (MineReport.mine_report_definition_id.isnot(None), 
                MineReportDefinition.report_name),
                (MineReport.permit_condition_category_code.isnot(None),
                PermitConditionCategory.description),
                else_=MineReportPermitRequirement.report_name
            )
            filtered_query = filtered_query.order_by(
                asc(order_clause) if args['sort_dir'] == 'asc' else desc(order_clause)
            )
        elif args['sort_field'] == 'permit_number':
            filtered_query = filtered_query.outerjoin(MineReport.permit)
            order_clause = Permit.permit_no
            filtered_query = filtered_query.order_by(
                asc(order_clause) if args['sort_dir'] == 'asc' else desc(order_clause)
            )
        else:
            if args['sort_field'] and args['sort_dir']:
                sort_criteria = [{
                    'model': sort_models[args['sort_field']],
                    'field': sort_field[args['sort_field']],
                    'direction': args['sort_dir']
                }]
            else:
                sort_criteria = [{
                    'model': 'MineReport',
                    'field': 'received_date',
                    'direction': 'desc'
                }]

            filtered_query = apply_sort(filtered_query, sort_criteria)

        return apply_pagination(filtered_query, args["page_number"], args["page_size"])
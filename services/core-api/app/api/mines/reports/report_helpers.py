# report_helpers.py
from sqlalchemy import asc, desc
from sqlalchemy_filters import apply_sort, apply_pagination, apply_filters

from app.api.mines.mine.models.mine import Mine
from app.api.mines.reports.models.mine_report import MineReport
from app.api.mines.reports.models.mine_report_category import MineReportCategory
from app.api.mines.reports.models.mine_report_category_xref import MineReportCategoryXref
from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
from sqlalchemy import case
from app.api.mines.permits.permit_conditions.models.permit_condition_category import PermitConditionCategory
from app.api.mines.reports.models.mine_report_permit_requirement import MineReportPermitRequirement
from app.api.mines.permits.permit.models.permit import Permit
import uuid

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
            query = query.join(
                MineReportDefinition, MineReport.mine_report_definition_id ==
                                      MineReportDefinition.mine_report_definition_id)
            query = query.join(
                MineReportCategoryXref, MineReportDefinition.mine_report_definition_id ==
                                        MineReportCategoryXref.mine_report_definition_id)
            query = query.join(
                MineReportCategory, MineReportCategoryXref.mine_report_category ==
                                    MineReportCategory.mine_report_category)

        if args["major"]:
            conditions.append(ReportFilterHelper.build_filter('Mine', 'major_mine_ind', '==', args["major"]))

        if args["region"]:
            conditions.append(ReportFilterHelper.build_filter('Mine', 'mine_region', 'in', args["region"]))

        if args["report_type"]:
            conditions.append(
                ReportFilterHelper.build_filter('MineReportCategoryXref', 'mine_report_category', 'in',
                                                args["report_type"]))

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

        if args['permit_guid']:
            query = query.filter(MineReport.permit_guid == args["permit_guid"])

        filtered_query = apply_filters(query, conditions)

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
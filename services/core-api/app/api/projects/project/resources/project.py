from datetime import date, datetime
import pytz
from flask import request
from flask_restplus import Resource
from sqlalchemy_filters import apply_sort, apply_pagination, apply_filters
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.mines.mine.models.mine import Mine
from app.api.utils.access_decorators import MINESPACE_PROPONENT, requires_any_of, VIEW_ALL, is_minespace_user
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.projects.response_models import PROJECT_MODEL, PAGINATED_PROJECT_LIST
from app.api.projects.project.models.project import Project
from app.api.projects.project_summary.models.project_summary import ProjectSummary
from app.api.projects.information_requirements_table.models.information_requirements_table import InformationRequirementsTable
from app.api.projects.major_mine_application.models.major_mine_application import MajorMineApplication
from app.api.parties.party.models.party import Party
from app.api.mines.mine.models.mine_type_detail import MineTypeDetail
from app.api.mines.mine.models.mine_type import MineType
from app.api.mines.mine.models.mine import Mine

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25


class ProjectResource(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument(
        'mrc_review_required',
        type=bool,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'contacts',
        type=list,
        location='json',
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'project_lead_party_guid',
        type=str,
        store_missing=False,
        required=False,
    )

    @api.doc(
        description='Get a Project.', params={'project_guid': 'The GUID of the Project to get.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PROJECT_MODEL, code=200)
    def get(self, project_guid):
        project = Project.find_by_project_guid(project_guid)
        if project is None:
            raise NotFound('Project not found')

        return project

    @api.doc(
        description='Update a Project.', params={'project_guid': 'The GUID of the Project to get.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PROJECT_MODEL, code=200)
    def put(self, project_guid):
        project = Project.find_by_project_guid(project_guid)
        if project is None:
            raise NotFound('Project not found')

        data = self.parser.parse_args()
        project_lead_party_guid = project.project_lead_party_guid if is_minespace_user() else data.get('project_lead_party_guid')
        project.update(project.project_title, project.proponent_project_id,
                       project_lead_party_guid, data.get('mrc_review_required', False),
                       data.get('contacts', []))
        updated_project = project.save()

        return updated_project, 201


class ProjectListResource(Resource, UserMixin):
    @api.doc(
        description='Get a list of all Projects for a given mine.',
        params={'mine_guid': 'The GUID of the mine to get Projects for.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PROJECT_MODEL, code=200, envelope='records')
    def get(self):
        mine_guid = request.args.get('mine_guid', type=str)
        mine = Mine.find_by_mine_guid(mine_guid)
        if mine is None:
            raise NotFound('Mine not found')

        projects = Project.find_by_mine_guid(mine_guid)
        return projects


class ProjectListDashboardResource(Resource, UserMixin):
    @api.doc(
        description='Return a list of filtered major projects.',
        params={
            'page_number': f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
            'per_page': f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
            'mine_guid': 'The GUID of the mine to get Projects for.',
            'project_title': 'Title for the project',
            'proponent_project_id': 'Project ID',
            'mrc_review_required': 'Filter by Mine Review Committee required (MRC)',
            'project_stage': 'project stage (Project Summary, IRT, Final Application) to filter the project list on.',
            'status_code': 'Filter by status code.',
            'contact': 'Primary contact for the project',
            'project_lead_name': 'EMLI project lead for the project',
            'mine_commodity_code': 'A specific commodity to filter the project list on.',
            'update_timestamp': 'filter by projects by updated date',
            'sort_field': 'The field the returned results will be ordered by',
            'sort_dir': 'The direction by which the sort field is ordered',
        })
    @api.marshal_with(PAGINATED_PROJECT_LIST, code=200)
    def get(self):
        args = {
            "page_number": request.args.get('page', PAGE_DEFAULT, type=int),
            "sort_field": request.args.get('sort_field', 'project_id', type=str),
            "sort_dir": request.args.get('sort_dir', 'asc', type=str),
            "page_size": request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            "search_terms": request.args.get('search', type=str),
            "mrc_review_required": request.args.get('mrc_review_required', type=str),
            "project_lead_name": request.args.get('project_lead_name', type=str),
            "status_code": request.args.get('status_code', type=str),
            "application_stage": request.args.get('application_stage', type=str),
            "mine_commodity_code": request.args.get('mine_commodity_code', type=str),
            "update_timestamp": request.args.get('updated_date', type=str)
        }
        update_timestamp_args = args['update_timestamp']
        paginated_project_query, pagination_details = self._apply_filters_and_pagination(args)

        projects = paginated_project_query.all()

        most_recent_projects = list()
        for project in projects:
            all_stages = list()
            if project.project_summary and project.project_summary.project_summary_id:
                all_stages.append({'key': 'Project Summary', 'update_timestamp': project.project_summary.update_timestamp})
            if project.information_requirements_table and project.information_requirements_table.irt_id:
                all_stages.append({'key': 'IRT', 'update_timestamp': project.information_requirements_table.update_timestamp})
            if project.major_mine_application and project.major_mine_application.major_mine_application_id:
                all_stages.append({'key': 'Final Application', 'update_timestamp': project.major_mine_application.update_timestamp})

            all_stages.sort(key=lambda x: x['update_timestamp'], reverse=True)

            id = guid = status_code = stage = record = None
            if all_stages:
                stage = all_stages[0]['key']
                update_timestamp = all_stages[0]['update_timestamp']

                if stage == 'Project Summary':
                    id = project.project_summary.project_summary_id
                    guid = project.project_summary.project_summary_guid
                    status_code = project.project_summary.status_code
                elif stage == 'IRT':
                    id = project.information_requirements_table.irt_id
                    guid = project.information_requirements_table.irt_guid
                    status_code = project.information_requirements_table.status_code
                else:
                    id = project.major_mine_application.major_mine_application_id
                    guid = project.major_mine_application.major_mine_application_guid
                    status_code = project.major_mine_application.status_code

                status_code_filter_pass = update_timestamp_filter_pass = False

                if args['status_code'] and status_code in args['status_code'] or args['status_code'] is None:
                    status_code_filter_pass = True

                update_timestamp_args = args['update_timestamp']

                if args['update_timestamp']:
                    update_timestamp_args = datetime.strptime(args['update_timestamp'], "%Y-%m-%d").date()
                    if update_timestamp.replace(tzinfo=None).date() >= update_timestamp_args:
                        update_timestamp_filter_pass = True
                else:
                    update_timestamp_filter_pass = True

                if status_code_filter_pass and update_timestamp_filter_pass:
                    record = {
                        'stage': stage,
                        'id': id,
                        'guid': guid,
                        'project_title': project.project_title,
                        'project_id': project.project_id,
                        'project_guid': project.project_guid,
                        'mrc_review_required': project.mrc_review_required,
                        'status_code': status_code,
                        'contacts': project.contacts,
                        'project_lead_party_guid': project.project_lead_party_guid,
                        'project_lead_name': project.project_lead_name,
                        'update_timestamp': update_timestamp,
                        'mine': project.mine
                    }

            if record:
                most_recent_projects.append(record)

        return {
            'records': most_recent_projects,
            'current_page': pagination_details.page_number,
            'total_pages': pagination_details.num_pages,
            'items_per_page': pagination_details.page_size,
            'total': pagination_details.total_results,
        }

    @classmethod
    def _build_filter(cls, model, field, op, argfield):
        return {'model': model, 'field': field, 'op': op, 'value': argfield}

    @classmethod
    def _build_spec(cls, model, fields):
        return {'model': model, 'fields': fields}

    def _apply_filters_and_pagination(self, args):
        sort_models = {
            'project_title': 'Project',
            'project_id': 'Project',
            'first_name': 'Party',
            'party_name': 'Party',
            'mrc_review_required': 'Project',
            'mine_name': 'Mine',
        }

        if args['sort_field'] == 'project_lead_name':
            sort_model = 'Party'
        else:
            sort_model = sort_models.get(args['sort_field'])

        query = Project.query
        conditions = []

        if args["search_terms"] is not None:
            search_conditions = [
                self._build_filter('Mine', 'mine_name', 'ilike', '%{}%'.format(args["search_terms"])),
                self._build_filter('Mine', 'mine_no', 'ilike', '%{}%'.format(args["search_terms"]))
            ]
            conditions.append({'or': search_conditions})

        if args["mrc_review_required"]:
            mrc_review_required = True if args["mrc_review_required"] == "true" else False
            conditions.append(self._build_filter('Project', 'mrc_review_required', '==', mrc_review_required))

        application_stage = args.get("application_stage", None)

        if application_stage:
            if application_stage == 'InformationRequirementsTable':
                query = query.join(InformationRequirementsTable)
            if application_stage == 'MajorMineApplication':
                query = query.join(MajorMineApplication)
            if application_stage == 'ProjectSummary':
                query = query.join(ProjectSummary)
        else:
            query = query.join(ProjectSummary, isouter=True).join(InformationRequirementsTable, isouter=True). join(MajorMineApplication, isouter=True).join(Party, isouter=True)

        if args["mine_commodity_code"]:
            conditions.append(self._build_filter('MineType', 'active_ind', '==', True))
            conditions.append(self._build_filter('MineTypeDetail', 'mine_commodity_code', '==', args["mine_commodity_code"]))

        if args['status_code']:
            if application_stage:
                if application_stage == 'ProjectSummary':
                    conditions.append(self._build_filter('ProjectSummary', 'status_code', '==', args["status_code"]))
                if application_stage == 'InformationRequirementsTable':
                    conditions.append(self._build_filter('InformationRequirementsTable', 'status_code', '==', args["status_code"]))
                if application_stage == 'MajorMineApplication':
                    conditions.append(self._build_filter('MajorMineApplication', 'status_code', '==', args["status_code"]))
            else:
                code_status = [
                    self._build_filter('ProjectSummary', 'status_code', '==', args["status_code"]),
                    self._build_filter('InformationRequirementsTable', 'status_code', '==', args["status_code"]),
                    self._build_filter('MajorMineApplication', 'status_code', '==', args["status_code"])
                ]
                conditions.append({'or': code_status})

        if args["update_timestamp"]:
            if application_stage:
                if application_stage == 'ProjectSummary':
                    conditions.append(self._build_filter('ProjectSummary', 'update_timestamp', '>=', args["update_timestamp"]))
                if application_stage == 'InformationRequirementsTable':
                    conditions.append(self._build_filter('InformationRequirementsTable', 'update_timestamp', '>=', args["update_timestamp"]))
                if application_stage == 'MajorMineApplication':
                    conditions.append(self._build_filter('MajorMineApplication', 'update_timestamp', '>=', args["update_timestamp"]))
            else:
                update_timestamp = [
                    self._build_filter('ProjectSummary', 'update_timestamp', '>=', args['update_timestamp']),
                    self._build_filter('InformationRequirementsTable', 'update_timestamp', '>=', args['update_timestamp']),
                    self._build_filter('MajorMineApplication', 'update_timestamp', '>=', args['update_timestamp'])
                ]
                conditions.append({'or': update_timestamp})

        if args['project_lead_name'] is not None:
            lead_items = args['project_lead_name'].split()
            project_lead_conditions = []
            if len(lead_items) == 1:
                project_lead_conditions = [
                    self._build_filter('Party', 'first_name', 'ilike', '%{}%'.format(lead_items[0])),
                    self._build_filter('Party', 'party_name', 'ilike', '%{}%'.format(lead_items[0]))
                ]
            elif len(lead_items) > 1:
                project_lead_conditions = [
                    self._build_filter('Party', 'first_name', 'ilike', '%{}%'.format(lead_items[:-1])),
                    self._build_filter('Party', 'party_name', 'ilike', '%{}%'.format(lead_items[-1]))
                ]
            else:
                project_lead_conditions = []

            if len(project_lead_conditions) == 2:
                conditions.append({'or': project_lead_conditions})

        projects_query = apply_filters(query, conditions)

        # Apply sorting
        if sort_model and args['sort_field'] and args['sort_dir']:
            sort_criteria = []
            if sort_model == 'Party':
                sort_criteria = [{'model': sort_model, 'field': 'first_name', 'direction': args['sort_dir']},
                                 {'model': sort_model, 'field': 'party_name', 'direction': args['sort_dir']}]
            else:
                sort_criteria = [{'model': sort_model, 'field': args['sort_field'], 'direction': args['sort_dir']}]

            projects_query = apply_sort(projects_query, sort_criteria)

        return apply_pagination(projects_query, args["page_number"], args["page_size"])

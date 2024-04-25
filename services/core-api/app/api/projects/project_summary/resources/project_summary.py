from flask import current_app
from flask_restx import Resource, inputs
from datetime import datetime, timezone
from werkzeug.exceptions import BadRequest, NotFound

from app.extensions import api
from app.api.activity.utils import trigger_notification
from app.api.utils.access_decorators import MINESPACE_PROPONENT, requires_any_of, VIEW_ALL, MINE_ADMIN, is_minespace_user, EDIT_PROJECT_SUMMARIES
from app.api.mines.mine.models.mine import Mine
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.projects.response_models import PROJECT_SUMMARY_MODEL
from app.api.projects.project_summary.models.project_summary import ProjectSummary
from app.api.projects.project.models.project import Project
from app.api.activity.models.activity_notification import ActivityType

from app.api.activity.utils import trigger_notification
from app.api.projects.project.project_util import ProjectUtil
from decimal import Decimal

PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25


class ProjectSummaryResource(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument(
        'mine_guid',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'status_code',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'project_summary_description',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'documents',
        type=list,
        location='json',
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'project_summary_title',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'proponent_project_id',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'project_lead_party_guid',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'expected_draft_irt_submission_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'expected_permit_application_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'expected_permit_receipt_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'expected_project_start_date',
        type=lambda x: inputs.datetime_from_iso8601(x) if x else None,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'agent', 
        type=dict, 
        location='json', 
        store_missing=False, 
        required=False
        )
    parser.add_argument('is_agent', type=bool, help="True if an agent is applying on behalf of the Applicant", location='json', store_missing=False, required=False)
    parser.add_argument('contacts', type=list, location='json', store_missing=False, required=False)
    parser.add_argument(
        'authorizations', type=list, location='json', store_missing=False, required=False)
    parser.add_argument('ams_authorizations', type=dict, location='json', store_missing=False, required=False)
    parser.add_argument('is_legal_land_owner', type=bool,location='json', store_missing=False, required=False)
    parser.add_argument('is_crown_land_federal_or_provincial', type=bool, location='json', store_missing=False, required=False)
    parser.add_argument('is_landowner_aware_of_discharge_application', type=bool, location='json', store_missing=False,
                        required=False)
    parser.add_argument('has_landowner_received_copy_of_application', type=bool, location='json', store_missing=False,
                        required=False)
    parser.add_argument(
        'legal_land_owner_name',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'legal_land_owner_contact_number',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'legal_land_owner_email_address',
        type=str,
        store_missing=False,
        required=False,
    )
    parser.add_argument(
        'facility_operator', 
        type=dict, 
        location='json', 
        store_missing=False, 
        required=False
    )
    parser.add_argument('facility_type', type=str, store_missing=False, required=False)
    parser.add_argument('facility_desc', type=str, store_missing=False, required=False)

    parser.add_argument('facility_latitude', type=lambda x: Decimal(x) if x else None, store_missing=False, required=False)
    parser.add_argument('facility_longitude', type=lambda x: Decimal(x) if x else None, store_missing=False, required=False)
    
    parser.add_argument('facility_coords_source', type=str, store_missing=False, required=False)
    parser.add_argument('facility_coords_source_desc', type=str, store_missing=False, required=False)
    parser.add_argument('facility_pid_pin_crown_file_no', type=str, store_missing=False, required=False)
    parser.add_argument('legal_land_desc', type=str, store_missing=False, required=False)
    parser.add_argument('facility_lease_no', type=str, store_missing=False, required=False)
    parser.add_argument('zoning', type=bool, store_missing=False, required=False)
    parser.add_argument('zoning_reason', type=str, store_missing=False, required=False)
    parser.add_argument('nearest_municipality', type=str, store_missing=False, required=False)

    parser.add_argument(
        'applicant',
        type=dict,
        location='json',
        store_missing=False,
        required=False
    )

    parser.add_argument('is_legal_address_same_as_mailing_address', type=bool, store_missing=False, required=False)
    parser.add_argument('is_billing_address_same_as_mailing_address', type=bool, store_missing=False, required=False)
    parser.add_argument('is_billing_address_same_as_legal_address', type=bool, store_missing=False, required=False)
    parser.add_argument('ams_terms_agreed', type=bool, store_missing=False, required=False)
    parser.add_argument('confirmation_of_submission', type=bool, store_missing=False, required=False)
    parser.add_argument('company_alias', type=str, store_missing=False, required=False)

    @api.doc(
        description='Get a Project Description.',
        params={
            'project_guid': 'The GUID of the project the Project Description belongs to.',
            'project_summary_guid': 'The GUID of the Project Description to get.'
        })
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PROJECT_SUMMARY_MODEL, code=200)
    def get(self, project_guid, project_summary_guid):
        project_summary = ProjectSummary.find_by_project_summary_guid(project_summary_guid,
                                                                      is_minespace_user())
        if project_summary is None:
            raise NotFound('Project Description not found')

        return project_summary

    @api.doc(
        description='Update a Project Description.',
        params={
            'project_guid': 'The GUID of the project the Project Description belongs to.',
            'project_summary_guid': 'The GUID of the Project Description to update.'
        })
    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT, EDIT_PROJECT_SUMMARIES])
    @api.marshal_with(PROJECT_SUMMARY_MODEL, code=200)
    def put(self, project_guid, project_summary_guid):
        project_summary = ProjectSummary.find_by_project_summary_guid(project_summary_guid,
                                                                      is_minespace_user())
        project = Project.find_by_project_guid(project_guid)

        data = self.parser.parse_args()
        mine_guid = data.get('mine_guid')
        mine = Mine.find_by_mine_guid(mine_guid)

        if project_summary is None:
            raise NotFound('Project Description not found')
        if project is None:
            raise NotFound('Project is not found')

        submission_date = project_summary.submission_date
        prev_status = project_summary.status_code
        if data.get('status_code') == 'SUB':
            valid_submission = project_summary.validate_new_submission(data)
            if valid_submission != True:
                raise BadRequest(valid_submission)
            if prev_status == 'DFT':
                submission_date = datetime.now(tz=timezone.utc)

        # Update project summary.
        project_summary.update(project, data.get('project_summary_description'),
                               data.get('expected_draft_irt_submission_date'),
                               data.get('expected_permit_application_date'),
                               data.get('expected_permit_receipt_date'),
                               data.get('expected_project_start_date'), data.get('status_code'),
                               data.get('project_lead_party_guid'),
                               data.get('documents', []), data.get('authorizations',[]),
                               data.get('ams_authorizations', None),
                               submission_date, data.get('agent'), data.get('is_agent'),
                               data.get('is_legal_land_owner'), data.get('is_crown_land_federal_or_provincial'),
                               data.get('is_landowner_aware_of_discharge_application'), data.get('has_landowner_received_copy_of_application'),
                               data.get('legal_land_owner_name'), data.get('legal_land_owner_contact_number'),
                               data.get('legal_land_owner_email_address'), data.get('facility_operator'),
                               data.get('facility_type'), data.get('facility_desc'),
                               data.get('facility_latitude'), data.get('facility_longitude'),
                               data.get('facility_coords_source'), data.get('facility_coords_source_desc'),
                               data.get('facility_pid_pin_crown_file_no'), data.get('legal_land_desc'),
                               data.get('facility_lease_no'), data.get('zoning'),
                               data.get('zoning_reason'),
                               data.get('nearest_municipality'),
                               data.get('applicant'),
                               data.get('is_legal_address_same_as_mailing_address'),
                               data.get('is_billing_address_same_as_mailing_address'),
                               data.get('is_billing_address_same_as_legal_address'),
                               data.get('contacts'),
                               data.get('company_alias'))

        project_summary.save()
        if prev_status == 'DFT' and project_summary.status_code == 'SUB':
            project_summary.send_project_summary_email(mine)
            # Trigger notification for newly submitted Project Summary
            message = f'A Major Mine Description called ({project.project_title}) has been submitted for ({project.mine_name})'
            extra_data = {'project': {'project_guid': str(project.project_guid)}}
            trigger_notification(message, ActivityType.major_mine_desc_submitted, project.mine, 'ProjectSummary', project_summary.project_summary_guid, extra_data)

        # Update project.
        project.update(
            data.get('project_summary_title'), data.get('proponent_project_id'),
            data.get('project_lead_party_guid'), data.get('mrc_review_required', False),
            data.get('contacts', []))
        project.save()

        if len(data.get('documents')) > 0:
            project = Project.find_by_project_guid(project_guid)
            ProjectUtil.notifiy_file_updates(project, mine)

        return project_summary

    @api.doc(
        description='Delete a Project Description.',
        params={
            'project_guid': 'The GUID of the project the Project Description belongs to.',
            'project_summary_guid': 'The GUID of the Project Description to delete.'
        })
    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT, EDIT_PROJECT_SUMMARIES])
    @api.response(204, 'Successfully deleted.')
    def delete(self, project_guid, project_summary_guid):
        project_summary = ProjectSummary.find_by_project_summary_guid(project_summary_guid,
                                                                      is_minespace_user())
        if project_summary is None:
            raise NotFound('Project Description not found')

        if project_summary.status_code == 'DFT':
            project_summary.delete()
            return None, 204

        raise BadRequest(
            'Project description must have status code of "DRAFT" to be eligible for deletion.')

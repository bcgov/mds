from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.utils.access_decorators import MINESPACE_PROPONENT, requires_any_of, VIEW_ALL
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser

from app.api.mines.project_summary.response_models import PROJECT_SUMMARY_CONTACT_MODEL
from app.api.mines.project_summary.models.project_summary_contact import ProjectSummaryContact
from app.api.mines.project_summary.models.project_summary import ProjectSummary


class ProjectSummaryContactResource(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument('name', type=str, store_missing=False, required=True)
    parser.add_argument('email', type=str, store_missing=False, required=True)
    parser.add_argument('phone_number', type=str, store_missing=False, required=True)
    parser.add_argument('job_title', type=str, store_missing=False, required=False)
    parser.add_argument('company_name', type=str, store_missing=False, required=False)
    parser.add_argument('phone_extension', type=str, store_missing=False, required=False)

    @api.doc(
        description='Get a Project Summary contact.',
        params={
            'mine_guid': 'The GUID of the mine the Project Summary belongs to.',
            'project_summary_guid': 'The GUID of the Project Summary to get.',
            'project_summary_contact_guid': 'The GUID of the Project Summary contact to get.'
        })
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PROJECT_SUMMARY_CONTACT_MODEL, code=200)
    def get(self, mine_guid, project_summary_guid, project_summary_contact_guid):
        project_summary_contact = ProjectSummaryContact.find_project_summary_contact_by_guid(
            project_summary_contact_guid)
        if project_summary_contact is None:
            raise NotFound('Project Summary contact not found')

        return project_summary_contact

    @api.doc(
        description='Update a Project Summary contact.',
        params={
            'mine_guid': 'The GUID of the mine the Project Summary belongs to.',
            'project_summary_guid': 'The GUID of the Project Summary to update.',
            'project_summary_contact_guid': 'The GUID of the Project Summary contact to get.'
        })
    @api.marshal_with(PROJECT_SUMMARY_CONTACT_MODEL, code=200)
    def put(self, mine_guid, project_summary_guid, project_summary_contact_guid):
        project_summary_contact = ProjectSummaryContact.find_project_summary_contact_by_guid(
            project_summary_contact_guid)
        if project_summary_contact is None:
            raise NotFound('Project Summary contact not found')

        data = self.parser.parse_args()
        project_summary_contact.update(
            data.get('name'), data.get('job_title'), data.get('company_name'), data.get('email'),
            data.get('phone_number'), data.get('phone_extension'))

        project_summary_contact.save()
        return project_summary_contact

    @api.doc(
        description='Delete a Project Summary contact.',
        params={
            'mine_guid': 'The GUID of the mine the Project Summary belongs to.',
            'project_summary_guid': 'The GUID of the Project Summary to delete.',
            'project_summary_contact_guid': 'The GUID of the Project Summary contact to get.'
        })
    # @requires_any_of([MINESPACE_PROPONENT])
    @api.response(204, 'Successfully deleted.')
    def delete(self, mine_guid, project_summary_guid, project_summary_contact_guid):
        project_summary = ProjectSummaryContact.find_project_summary_contact_by_guid(
            project_summary_contact_guid)
        if project_summary is None:
            raise NotFound('Project Summary contact not found')

        project_summary.delete()
        return None, 204


class ProjectSummaryContactListResource(Resource, UserMixin):

    parser = CustomReqparser()
    parser.add_argument('name', type=str, store_missing=False, required=True)
    parser.add_argument('email', type=str, store_missing=False, required=True)
    parser.add_argument('phone_number', type=str, store_missing=False, required=True)
    parser.add_argument('job_title', type=str, store_missing=False, required=False)
    parser.add_argument('company_name', type=str, store_missing=False, required=False)
    parser.add_argument('phone_extension', type=str, store_missing=False, required=False)

    @api.doc(
        description='Get a list of all contacts for a given Project Summary.',
        params={
            'mine_guid': 'The GUID of the mine to get Project Summaries for.',
            'project_summary_guid': 'The GUID of the Project Summary to get contacts for.'
        })
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(PROJECT_SUMMARY_CONTACT_MODEL, code=200, envelope='records')
    def get(self, mine_guid, project_summary_guid):
        project_summary = ProjectSummary.find_by_project_summary_guid(project_summary_guid)
        if project_summary is None:
            raise NotFound('Project Summary not found')

        project_summary_contacts = ProjectSummaryContact.find_project_summary_contacts_by_project_summary_guid(
            project_summary_guid)
        return project_summary_contacts

    @api.doc(
        description='Create a new Project Summary contact.',
        params={
            'mine_guid': 'The GUID of the mine to get Project Summaries for.',
            'project_summary_guid': 'The GUID of the Project Summary to get contacts for.'
        })
    @api.expect(parser)
    @requires_any_of([MINESPACE_PROPONENT])
    @api.marshal_with(PROJECT_SUMMARY_CONTACT_MODEL, code=201)
    def post(self, mine_guid, project_summary_guid):
        project_summary = ProjectSummary.find_by_project_summary_guid(project_summary_guid)
        if project_summary is None:
            raise NotFound('Project Summary not found')

        data = self.parser.parse_args()
        project_summary_contact = ProjectSummaryContact.create(project_summary, data.get('name'),
                                                               data.get('job_title'),
                                                               data.get('company_name'),
                                                               data.get('email'),
                                                               data.get('phone_number'),
                                                               data.get('phone_extension'))
        project_summary.save()

        return project_summary_contact, 201

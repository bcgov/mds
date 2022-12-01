from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, VIEW_ALL, MINESPACE_PROPONENT, MINE_ADMIN, EDIT_MAJOR_MINE_APPLICATIONS
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.custom_reqparser import CustomReqparser
from app.api.activity.utils import trigger_notifcation

from app.api.projects.response_models import MAJOR_MINE_APPLICATION_MODEL
from app.api.projects.major_mine_application.models.major_mine_application import MajorMineApplication
from app.api.projects.project.models.project import Project


class MajorMineApplicationResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument(
        'status_code',
        type=str,
        store_missing=False,
        required=True,
    )
    parser.add_argument(
        'documents',
        type=list,
        location='json',
        store_missing=False,
        required=False,
    )

    @api.doc(
        description="Get a Mine Major Applications for a given project.",
        params={'project_guid': 'The GUID of the project to get Mine Major Applications for.'})
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(MAJOR_MINE_APPLICATION_MODEL, code=200)
    def get(self, project_guid, major_mine_application_guid):
        mine_major_application = MajorMineApplication.find_by_major_mine_application_guid(
            major_mine_application_guid)
        if mine_major_application is None:
            raise NotFound('Major mine application not found.')

        return mine_major_application

    @api.doc(
        description='Update a major mine application.',
        params={
            'project_guid': 'The GUID of the project the Project Description belongs to.',
            'major_mine_application': 'The GUID of the major mine application to update.'
        })
    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT, EDIT_MAJOR_MINE_APPLICATIONS])
    @api.marshal_with(MAJOR_MINE_APPLICATION_MODEL, code=200)
    def put(self, project_guid, major_mine_application_guid):
        major_mine_application = MajorMineApplication.find_by_major_mine_application_guid(major_mine_application_guid)

        project = Project.find_by_project_guid(project_guid)

        data = self.parser.parse_args()

        if major_mine_application is None:
            raise NotFound('Major Mine Application not found')

        if project is None:
            raise NotFound('Project is not found')

        current_status_code = major_mine_application.status_code
        new_status_code = data.get('status_code')
        major_mine_application.update(project,
                                      new_status_code,
                                      data.get('documents', []))

        major_mine_application.save()
        if current_status_code != "SUB" and new_status_code == "SUB":
            major_mine_application.send_mma_submit_email()
            # Trigger notification for newly submitted MMA
            message = f'A Major Mine Application for ({project.project_title}) has been submitted for ({project.mine_name})'
            extra_data = {'project': {'project_guid': str(project.project_guid)}}
            trigger_notifcation(message, project.mine, 'MajorMineApplication', major_mine_application.major_mine_application_guid, extra_data)

        return major_mine_application

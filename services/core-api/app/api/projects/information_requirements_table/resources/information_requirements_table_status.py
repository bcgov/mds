from flask_restx import Resource
from werkzeug.exceptions import BadRequest
from flask import request

from app.extensions import api
from app.api.utils.access_decorators import MINESPACE_PROPONENT, requires_any_of, MINE_ADMIN, EDIT_INFORMATION_REQUIREMENTS_TABLE
from app.api.utils.resources_mixins import UserMixin
from app.api.activity.utils import trigger_notification

from app.api.projects.response_models import IRT_MODEL
from app.api.projects.information_requirements_table.models.information_requirements_table import InformationRequirementsTable
from app.api.activity.models.activity_notification import ActivityType


class InformationRequirementsTableStatusResource(Resource, UserMixin):

    @api.expect(IRT_MODEL)
    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT, EDIT_INFORMATION_REQUIREMENTS_TABLE])
    @api.marshal_with(IRT_MODEL, code=200)
    def put(self, project_guid, irt_guid):

        try:
            irt = InformationRequirementsTable.find_by_irt_guid(irt_guid)
            current_status_code = irt.status_code
            data = request.json
            new_status_code = {'status_code': data['status_code']}
            irt_updated = irt.update(new_status_code)

            if current_status_code != 'APV' and new_status_code == 'APV':
                irt.send_irt_approval_email()
            elif current_status_code != 'SUB' and new_status_code == 'SUB':
                irt.send_irt_submit_email()
                # Trigger notification for newly submitted IRT
                message = f'An Information Requirements Table for ({irt.project.project_title}) has been submitted for ({irt.project.mine_name})'
                extra_data = {'project': {'project_guid': str(irt.project.project_guid)}}
                trigger_notification(message, ActivityType.ir_table_submitted, irt.project.mine, 'InformationRequirementsTable', irt.irt_guid, extra_data)

            return irt_updated

        except BadRequest as err:
            raise err

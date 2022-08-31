from flask_restplus import Resource
from werkzeug.exceptions import BadRequest, NotFound
from flask import request

from app.extensions import api
from app.api.utils.access_decorators import MINESPACE_PROPONENT, requires_any_of, VIEW_ALL, MINE_ADMIN, EDIT_INFORMATION_REQUIREMENTS_TABLE
from app.api.utils.resources_mixins import UserMixin

from app.api.projects.response_models import IRT_MODEL
from app.api.projects.information_requirements_table.models.information_requirements_table import InformationRequirementsTable
from app.api.projects.information_requirements_table.resources.information_requirements_table_list import InformationRequirementsTableListResource


class InformationRequirementsTableResource(Resource, UserMixin):
    @api.doc(
        description='Get a Information Requirements Table by GUID.',
        params={
            'irt_guid':
            'The GUID of Information Requirements Table (IRT) to get.',
            'project_guid':
            'The GUID of Project associated to Information Requirements Table (IRT) to get.'
        })
    @requires_any_of([VIEW_ALL, MINESPACE_PROPONENT])
    @api.marshal_with(IRT_MODEL, code=200)
    def get(self, project_guid, irt_guid):
        irt = InformationRequirementsTable.find_by_irt_guid(irt_guid)
        if irt is None:
            raise NotFound('Information Requirements Table (IRT) not found.')

        return irt

    @api.doc(
        description='Update an Information Requirements Table for specific project.',
        params={
            'project_guid': 'The GUID of the project related to the IRT.',
            'irt_guid': 'The GUID of the Information Requirements Table (IRT) to update.'
        })
    @api.expect(IRT_MODEL)
    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT, EDIT_INFORMATION_REQUIREMENTS_TABLE])
    @api.marshal_with(IRT_MODEL, code=200)
    def put(self, project_guid, irt_guid):
        import_file = request.files.get('file')
        document_guid = request.form.get('document_guid')
        data = request.json
        try:
            irt = InformationRequirementsTable.find_by_irt_guid(irt_guid)
            if irt is None:
                raise NotFound('Information Requirements Table (IRT) not found.')
            if import_file and document_guid:
                sanitized_irt_requirements = InformationRequirementsTableListResource.build_irt_payload_from_excel(
                    import_file)
                irt_updated = irt.update(sanitized_irt_requirements, import_file, document_guid)
                return irt_updated
            irt_updated = irt.update(data)
            if irt.status_code != 'APV' and data['status_code'] == 'APV':
                irt.send_irt_approval_email()
            elif irt.status_code != 'SUB' and data['status_code'] == 'SUB':
                irt.send_irt_submit_email()
            return irt_updated
        except BadRequest as err:
            raise err

    @api.doc(
        description='Delete a Information Requirements Table (IRT).',
        params={
            'project_guid': 'GUID of Project associated to a IRT.',
            'irt_guid': 'GUID of the IRT to delete.'
        })
    @requires_any_of([MINE_ADMIN, MINESPACE_PROPONENT, EDIT_INFORMATION_REQUIREMENTS_TABLE])
    @api.response(204, 'Successfully deleted.')
    def delete(self, project_guid, irt_guid):
        irt = InformationRequirementsTable.find_by_irt_guid(irt_guid)

        if irt is None:
            raise NotFound('Information Requirements Table not found')

        if irt.status_code == 'SUB':
            irt.delete()

            return None, 204

        raise BadRequest(
            'Information Requirements Table must have status code of "Received" to be eligible for deletion.'
        )

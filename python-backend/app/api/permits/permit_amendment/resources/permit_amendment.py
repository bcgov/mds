from datetime import datetime
from flask_restplus import Resource, reqparse
from flask import current_app
from ...permit.models.permit import Permit
from ..models.permit_amendment import PermitAmendment
from ..models.permit_amendment_document import PermitAmendmentDocument
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view, requires_role_mine_create, requires_role_mine_admin
from ....utils.resources_mixins import UserMixin, ErrorMixin


class PermitAmendmentResource(Resource, UserMixin, ErrorMixin):
    parser = reqparse.RequestParser()

    parser.add_argument(
        'received_date',
        location='json',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        store_missing=False)
    parser.add_argument(
        'issue_date',
        location='json',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        store_missing=False)
    parser.add_argument(
        'authorization_end_date',
        location='json',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        store_missing=False)
    parser.add_argument(
        'permit_amendment_type_code', type=str, location='json', store_missing=False)
    parser.add_argument(
        'permit_amendment_status_code', type=str, location='json', store_missing=False)
    parser.add_argument('description', type=str, location='json', store_missing=False)
    parser.add_argument('uploadedFiles', type=list, location='json', store_missing=False)

    @api.doc(params={
        'permit_amendment_guid': 'Permit amendment guid.',
        'permit_guid': 'Permit GUID'
    })
    @requires_role_mine_view
    def get(self, permit_guid=None, permit_amendment_guid=None):
        if permit_amendment_guid:
            permit_amendment = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
            if permit_amendment:
                return permit_amendment.json()

        if permit_guid:
            permit = Permit.find_by_permit_guid(permit_guid)
            if permit:
                permit_amendments = PermitAmendment.find_by_permit_id(permit.permit_id)
                if permit_amendments:
                    return [x.json() for x in permit_amendments]

        return self.create_error_payload(404, 'Permit amendment(s) not found'), 404

    @api.doc(params={
        'permit_amendment_guid': 'Permit amendment guid.',
        'permit_guid': 'Permit GUID'
    })
    @requires_role_mine_create
    def post(self, permit_guid=None, permit_amendment_guid=None):
        if not permit_guid:
            return self.create_error_payload(400, 'Permit_guid must be provided'), 400
        if permit_amendment_guid:
            return self.create_error_payload(400, 'unexpected permit_amendement_id'), 400

        permit = Permit.find_by_permit_guid(permit_guid)
        if not permit:
            return self.create_error_payload(404, 'permit does not exist'), 404

        data = self.parser.parse_args()
        current_app.logger.info(f'creating permit_amendment with >> {data}')

        received_date = data.get('received_date')
        issue_date = data.get('issue_date')
        authorization_end_date = data.get('authorization_end_date')
        permit_amendment_type_code = data.get('permit_amendment_type_code', 'AMD')
        description = data.get('description')
        uploadedFiles = data.get('uploadedFiles', [])
        try:
            new_pa = PermitAmendment.create(
                permit,
                received_date,
                issue_date,
                authorization_end_date,
                permit_amendment_type_code,
                description=description,
                save=True)

            for newFile in uploadedFiles:
                new_pa_doc = PermitAmendmentDocument(
                    document_name=newFile['fileName'],
                    document_manager_guid=newFile['document_manager_guid'],
                    mine_guid=permit.mine_guid,
                )
                new_pa.documents.append(new_pa_doc)
            new_pa.save()
        except Exception as e:
            return self.create_error_payload(500, 'Error: {}'.format(e)), 500
        return new_pa.json()

    @api.doc(params={
        'permit_amendment_guid': 'Permit amendment guid.',
        'permit_guid': 'Permit GUID'
    })
    @requires_role_mine_create
    def put(self, permit_guid=None, permit_amendment_guid=None):
        if not permit_amendment_guid:
            return self.create_error_payload(400, 'permit_amendment_id must be provided'), 400
        pa = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not pa:
            return self.create_error_payload(404, 'permit amendment not found'), 404

        data = self.parser.parse_args()
        current_app.logger.info(f'updating {pa} with >> {data}')

        try:
            if 'received_date' in data:
                pa.received_date = data.get('received_date')
            if 'issue_date' in data:
                pa.issue_date = data.get('issue_date')
            if 'authorization_end_date' in data:
                pa.authorization_end_date = data.get('authorization_end_date')
            if 'permit_amendment_status_code' in data:
                pa.permit_amendment_status_code = data.get('permit_amendment_status_code')
            if 'permit_amendment_type_code' in data:
                pa.permit_amendment_type_code = data.get('permit_amendment_type_code')
            if 'description' in data:
                pa.description = data.get('description')
            for newFile in data.get('uploadedFiles', []):
                new_pa_doc = PermitAmendmentDocument(
                    document_name=newFile['fileName'],
                    document_manager_guid=newFile['document_manager_guid'],
                    mine_guid=pa.permit.mine_guid,
                )
                pa.documents.append(new_pa_doc)
            pa.save()
        except Exception as e:
            current_app.logger.error(f'PermitAmendmentResource.Put: Error >> {e}')
            return self.create_error_payload(500, f'Error: {e}'), 500

        return pa.json()

    @api.doc(params={
        'permit_amendment_guid': 'Permit amendment guid.',
        'permit_guid': 'Permit GUID'
    })
    @requires_role_mine_admin
    def delete(self, permit_guid=None, permit_amendment_guid=None):
        if not permit_amendment_guid:
            return self.create_error_payload(400, 'permit_amendment_id must be provided'), 400
        pa = PermitAmendment.find_by_permit_amendment_guid(permit_amendment_guid)
        if not pa:
            return self.create_error_payload(404, 'permit amendment not found'), 404

        pa.deleted_ind = True

        try:
            pa.save()
        except Exception as e:
            return self.create_error_payload(500, 'Error: {}'.format(e)), 500
        return ('', 204)

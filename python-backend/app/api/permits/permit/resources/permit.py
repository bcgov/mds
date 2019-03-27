from flask_restplus import Resource, reqparse
from datetime import datetime
from flask import current_app, request

from ..models.permit import Permit
from ...permit_amendment.models.permit_amendment import PermitAmendment
from ...permit_amendment.models.permit_amendment_document import PermitAmendmentDocument
from ....mines.mine.models.mine import Mine
from app.extensions import api, db
from app.api.utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from app.api.utils.resources_mixins import UserMixin, ErrorMixin


class PermitResource(Resource, UserMixin, ErrorMixin):

    parser = reqparse.RequestParser()
    parser.add_argument(
        'permit_no', type=str, help='Number of the permit being added.', location='json')
    parser.add_argument('mine_guid', type=str, help='guid of the mine.', location='json')
    parser.add_argument(
        'permit_status_code',
        type=str,
        location='json',
        help='Status of the permit being added.',
        store_missing=False)
    parser.add_argument(
        'received_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        location='json')
    parser.add_argument(
        'issue_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        location='json')
    parser.add_argument(
        'authorization_end_date',
        type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None,
        location='json')
    parser.add_argument(
        'permit_amendment_status_code',
        type=str,
        location='json',
        help='Status of the permit being added.')
    parser.add_argument(
        'description', type=str, location='json', help='Permit description', store_missing=False)
    parser.add_argument('uploadedFiles', type=list, location='json', store_missing=False)

    @api.doc(params={'permit_guid': 'Permit guid.'})
    @requires_role_mine_view
    def get(self, permit_guid=None):
        result = []
        permit_no = request.args.get('permit_no', None, type=str)

        if permit_no:
            permit = Permit.find_by_permit_no(permit_no)
            if permit:
                return permit.json()

        if permit_guid:
            permit = Permit.find_by_permit_guid(permit_guid)
            if not permit:
                return self.create_error_payload(404, 'Permit not found'), 404
            result = permit.json()

        elif request.args.get('mine_guid'):
            permits = Permit.find_by_mine_guid(request.args.get('mine_guid'))
            if permits:
                result = [p.json() for p in permits]

        return result

    @api.doc(params={'permit_guid': 'Permit guid.'})
    @requires_role_mine_create
    def post(self, permit_guid=None):
        if permit_guid:
            return self.create_error_payload(400, 'unexpected permit_guid'), 400

        data = self.parser.parse_args()

        mine = Mine.find_by_mine_guid(data.get('mine_guid'))
        if not mine:
            return self.create_error_payload(
                404, 'There was no mine found with the provided mine_guid.'), 404

        permit = Permit.find_by_permit_no(data.get('permit_no'))
        if permit:
            return self.create_error_payload(400, 'That permit number is already in use.'), 400

        uploadedFiles = data.get('uploadedFiles', [])
        try:
            permit = Permit.create(mine.mine_guid, data.get('permit_no'),
                                   data.get('permit_status_code'))

            amendment = PermitAmendment.create(
                permit,
                data.get('received_date'),
                data.get('issue_date'),
                data.get('authorization_end_date'),
                'OGP',
                description='Initial permit issued.')
            db.session.add(permit)
            db.session.add(amendment)

            for newFile in uploadedFiles:
                new_pa_doc = PermitAmendmentDocument(
                    document_name=newFile['fileName'],
                    document_manager_guid=newFile['document_manager_guid'],
                    mine_guid=permit.mine_guid,
                )
                amendment.documents.append(new_pa_doc)
            db.session.commit()
        except Exception as e:
            self.raise_error(500, 'Error: {}'.format(e))
        return permit.json()

    @api.doc(params={'permit_guid': 'Permit guid.'})
    @requires_role_mine_create
    def put(self, permit_guid=None):
        if not permit_guid:
            return self.create_error_payload(400, 'Error: Permit guid was not provided.'), 400

        permit = Permit.find_by_permit_guid(permit_guid)

        if not permit:
            return self.create_error_payload(404, 'There was no permit found with that guid.'), 404

        data = self.parser.parse_args()
        if 'permit_status_code' in data:
            permit.permit_status_code = data.get('permit_status_code')
        if 'description' in data:
            permit.description = data.get('description')

        try:
            permit.save()
        except Exception as e:
            self.raise_error(500, 'Error: {}'.format(e))
        return permit.json()

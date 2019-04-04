from flask_restplus import Resource, fields
from sqlalchemy.exc import DBAPIError
from werkzeug.exceptions import BadRequest, NotFound

from ..models.variance import VarianceDocument
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin

mine_document_model = api.model('MineDocument', {
    'mine_document_guid': fields.String,
    'mine_guid': fields.String,
    'document_manager_guid': fields.String,
    'document_name': fields.String,
    'active_ind': fields.Boolean
})

variance_document_model = api.model('VarianceDocument', {
    'variance_document_xref_guid': fields.String,
    'variance_id': fields.Integer,
    'mine_document_guid': fields.String,
    'details': fields.Nested(mine_document_model)
})

class VarianceDocumentListResource(Resource, UserMixin, ErrorMixin):
    @api.doc(
        description=
        'This endpoint returns a list of all mine documents associated with the variance.'
    )
    @requires_role_mine_view
    @api.marshal_with(variance_document_model, code=200, envelope='records')
    def get(self, mine_guid, variance_id):
        try:
            records = VarianceDocument.find_by_variance_id(variance_id)
        except DBAPIError:
            raise BadRequest('Invalid variance_id')

        if records is None:
            records = []

        return records


class VarianceDocumentResource(Resource, UserMixin, ErrorMixin):
    @api.doc(
        description=
        'This endpoint returns a requested mine document.',
        params={
            'variance_id': 'ID of variance from which to fetch documents',
            'mine_document_guid': 'guid for the document to fetch'
        }
    )
    @requires_role_mine_view
    @api.marshal_with(variance_document_model, code=200)
    def get(self, mine_guid, variance_id, mine_document_guid):
        try:
            document = VarianceDocument.find_by_mine_document_guid_and_variance_id(
                mine_document_guid,
                variance_id)
        except DBAPIError:
            raise BadRequest('Invalid mine_document_guid')

        if document is None:
            raise NotFound('Document not found')

        return document

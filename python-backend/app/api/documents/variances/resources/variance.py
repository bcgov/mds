from datetime import datetime
from flask_restplus import Resource, reqparse
from sqlalchemy.exc import DBAPIError
from werkzeug.exceptions import BadRequest, NotFound

from ..models.variance import VarianceDocument
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view, requires_role_mine_create
from ....utils.resources_mixins import UserMixin, ErrorMixin
from ....utils.url import get_documents_svc_url


class VarianceDocumentResource(Resource, UserMixin, ErrorMixin):
    @api.doc(
        params={
            'variance_id': 'ID of variance from which to fetch documents',
            'mine_document_guid': 'guid representing the document to fetch'
        }
    )
    @requires_role_mine_view
    def get(self, variance_id=None, mine_document_guid=None):
        if not variance_id:
            raise BadRequest('Missing variance_id')

        # Find single document
        if mine_document_guid:
            try:
                document = VarianceDocument.find_by_mine_document_guid_and_variance_id(
                    mine_document_guid,
                    variance_id)
            except DBAPIError:
                raise BadRequest('Invalid mine_document_guid')
            if document != None:
                return document.json()

        # Find all documents for the variance
        try:
            documents = VarianceDocument.find_by_variance_id(variance_id)
        except DBAPIError:
            raise BadRequest('Invalid variance_id')
        if documents != None:
            return { 'records': [x.json() for x in documents] }
        else:
            raise NotFound('Unable to fetch variances')

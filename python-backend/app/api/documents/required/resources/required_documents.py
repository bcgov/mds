from flask import request
from flask_restplus import Resource
from ..models.required_documents import RequiredDocument
from app.extensions import api
from ....utils.access_decorators import requires_role_mine_view
from ....utils.resources_mixins import UserMixin, ErrorMixin


class RequiredDocumentResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'req_doc_guid': 'Required Document guid.'})
    @requires_role_mine_view
    def get(self, req_doc_guid=None):
        result = []
        if req_doc_guid:
            req_doc = RequiredDocument.find_by_req_doc_guid(req_doc_guid)
            if not req_doc:
                return self.create_error_payload(404, 'Required Document not found'), 404
            result = req_doc.json()

        else:
            search_category = request.args.get('category')
            if search_category:
                req_docs = RequiredDocument.find_by_req_doc_category(search_category.upper())
            else:
                req_docs = RequiredDocument.query.all()
            result = [x.json() for x in req_docs]
        return result
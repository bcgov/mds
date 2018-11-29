from flask import request
from flask_restplus import Resource
from ..models.required_documents import RequiredDocument
from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin


class RequiredDocumentResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'req_doc_guid': 'Required Document guid.'})
    @jwt.requires_roles(["mds-mine-view"])
    def get(self, req_doc_guid=None):
        if req_doc_guid:
            req_doc = RequiredDocument.find_by_req_doc_guid(req_doc_guid)
            if req_doc:
                return req_doc.json()
            return self.create_error_payload(404, 'Required Document not found')
        else:
            search_category = request.args.get('category', None, type=str)
            if search_category:
                req_docs = RequiredDocument.find_by_req_doc_category(search_category)
            else:
                req_docs = RequiredDocument.query.all();
            return { 'required_documents' : list(map(lambda x: x.json(), req_docs))  }

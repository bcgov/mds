from flask_restplus import Resource
from ..models.required_document import RequiredDocument
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
            return self.create_error_payload(404, 'Required Document not found'), 404
        else:
            req_docs = RequiredDocument.query.all();

            return {list(map(lambda x: x.json(), req_docs))}
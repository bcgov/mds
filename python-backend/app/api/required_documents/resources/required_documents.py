from flask import request
from flask_restplus import Resource
from ..models.required_documents import RequiredDocument
from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin, ErrorMixin
from werkzeug.exceptions import BadRequest, NotFound


class RequiredDocumentListResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'req_doc_guid': 'Required Document guid.'})
    @requires_role_view_all
    def get(self):
        search_category = request.args.get('category')
        search_sub_category = request.args.get('sub_category')

        if search_category:
            search_sub_category = search_sub_category.upper() if search_sub_category else None
            req_docs = RequiredDocument.find_by_req_doc_category(search_category.upper(),
                                                                 search_sub_category)
        else:
            req_docs = RequiredDocument.query.all()
        result = {'required_documents': [x.json() for x in req_docs]}
        return result


class RequiredDocumentResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'req_doc_guid': 'Required Document guid.'})
    @requires_role_view_all
    def get(self, req_doc_guid):
        req_doc = RequiredDocument.find_by_req_doc_guid(req_doc_guid)
        if not req_doc:
            raise NotFound("Required Document Not found.")
        result = req_doc.json()
        return result

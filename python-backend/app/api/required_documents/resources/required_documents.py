from flask import request
from flask_restplus import Resource, fields
from ..models.required_documents import RequiredDocument
from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin, ErrorMixin
from werkzeug.exceptions import BadRequest, NotFound

REQUIRED_DOCUMENT_MODEL = api.model(
    'RequiredDocument', {
        'req_document_guid': fields.String,
        'req_document_name': fields.String,
        'req_document_category': fields.String,
        'req_document_sub_category_code': fields.String,
        'req_document_due_date_type': fields.String,
        'req_document_due_date_period_months': fields.Integer,
        'hsrc_code': fields.String,
        'description': fields.String,
    })


class RequiredDocumentListResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'req_doc_guid': 'Required Document guid.'})
    @requires_role_view_all
    @api.marshal_with(REQUIRED_DOCUMENT_MODEL, code=200, envelope='records')
    def get(self):
        search_category = request.args.get('category')
        search_sub_category = request.args.get('sub_category')

        if search_category:
            search_sub_category = search_sub_category.upper() if search_sub_category else None
            req_docs = RequiredDocument.find_by_req_doc_category(search_category.upper(),
                                                                 search_sub_category)
        else:
            req_docs = RequiredDocument.query.all()
        return req_docs


class RequiredDocumentResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'req_doc_guid': 'Required Document guid.'})
    @requires_role_view_all
    @api.marshal_with(REQUIRED_DOCUMENT_MODEL, code=200)
    def get(self, req_doc_guid):
        req_doc = RequiredDocument.find_by_req_doc_guid(req_doc_guid)
        if not req_doc:
            raise NotFound("Required Document Not found.")

        return req_doc

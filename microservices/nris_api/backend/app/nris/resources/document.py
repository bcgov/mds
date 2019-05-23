from flask import request
from flask_restplus import Resource

from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.nris.utils.access_decorators import requires_role_nris_view

from app.nris.models.document import Document, DOCUMENT_RESPONSE_MODEL


@api.route('/documents')
class DocumentListResource(Resource):
    @api.marshal_with(DOCUMENT_RESPONSE_MODEL, envelope='records', code=200)
    @requires_role_nris_view
    def get(self):
        filter_fields = ['document_type', 'file_name']
        filtered_params = {k: v for (k, v) in request.args.items() if k in filter_fields}
        filtered_results = Document.query.filter_by(**filtered_params).all()
        return filtered_results


@api.route('/documents/<int:external_id>')
class InspectionListResource(Resource):
    @api.marshal_with(DOCUMENT_RESPONSE_MODEL, code=200)
    @requires_role_nris_view
    def get(self, external_id):
        item = Document.query.filter_by(external_id=external_id).first()
        if not item:
            raise NotFound("Document not found")
        return item
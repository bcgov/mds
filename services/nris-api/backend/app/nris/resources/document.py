from flask import request
from flask_restx import Resource, marshal

from werkzeug.exceptions import BadRequest, NotFound, InternalServerError

from app.extensions import api, db
from app.nris.utils.access_decorators import requires_role_nris_view

from app.nris.models.document import Document as Model, DOCUMENT_RESPONSE_MODEL as RESPONSE_MODEL

module_path = 'documents'
filter_fields = ['document_type', 'file_name']


@api.route(f'/{module_path}')
class DocumentListResource(Resource):
    @api.doc(params={field: "Filter by exact match" for field in filter_fields})
    @api.marshal_with(RESPONSE_MODEL, envelope='records', code=200)
    @requires_role_nris_view
    def get(self):
        filtered_params = {k: v.strip() for (k, v) in request.args.items() if k in filter_fields}
        filtered_results = Model.query.filter_by(**filtered_params).all()
        return filtered_results


@api.route(f'/{module_path}/<int:id>')
class DocumentResource(Resource):
    @requires_role_nris_view
    @api.marshal_with(RESPONSE_MODEL, code=200)
    def get(self, id):
        result = Model.query.filter_by(external_id=id).first()
        print(result)
        print(result.file_name)

        if not result:
            raise NotFound(f"{Model.__name__} not found")
        return result

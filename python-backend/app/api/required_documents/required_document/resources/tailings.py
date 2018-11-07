from flask_restplus import Resource
from ..models.required_document import RequiredDocument
from app.extensions import jwt, api
from ....utils.resources_mixins import UserMixin, ErrorMixin


class RequiredTailingsDocumentsResource(Resource, UserMixin, ErrorMixin):
    @api.doc(params={'req_doc_guid': 'Required Document guid.'})
    @jwt.requires_roles(["mds-mine-view"])
    def get(self):
        tailings_req_docs = RequiredDocument.query.filter_by(req_document_category='MINE_TAILINGS').all()
        return {
            'required_documents' : list(map(lambda x: x.json(), tailings_req_docs))
        }        
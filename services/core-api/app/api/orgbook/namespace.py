from flask_restx import Namespace

from app.api.orgbook.resources.orgbook_resources import SearchResource, CredentialResource

api = Namespace('orgbook', description='OrgBook API Gateway')

api.add_resource(SearchResource, '/search')
api.add_resource(CredentialResource, '/credential/<int:credential_id>')

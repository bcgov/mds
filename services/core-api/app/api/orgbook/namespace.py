from flask_restx import Namespace

from app.api.orgbook.resources.orgbook_resources import SearchResource, CredentialResource, VerifyResource

api = Namespace('orgbook', description='OrgBook API Gateway')

api.add_resource(SearchResource, '/search')
api.add_resource(CredentialResource, '/credential/<int:credential_id>')
api.add_resource(VerifyResource, '/credential/<int:credential_id>/verify')

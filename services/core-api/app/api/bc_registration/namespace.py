from flask_restx import Namespace

from app.api.bc_registration.resources.bc_registration_resources import SearchResource, CredentialResource

api = Namespace(
    'bc-registration', description='BC Registrations - sourced from BC Registries API / Orgbook')

api.add_resource(SearchResource, '/search')
api.add_resource(CredentialResource, '/orgbook/credential/<string:credential_id>')

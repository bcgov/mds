from flask_restplus import Namespace

from app.api.orgbook.resources.orgbook_resources import SearchAutocompleteList, CredentialRetrieveFormatted

api = Namespace('orgbook', description='OrgBook API Gateway')

api.add_resource(SearchAutocompleteList, '/search')
api.add_resource(CredentialRetrieveFormatted, '/credential/<int:credential_id>')

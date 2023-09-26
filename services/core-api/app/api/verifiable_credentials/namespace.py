from flask_restplus import Namespace

from app.api.verifiable_credentials.resources.verifiable_credential import VerifiableCredentialResource
from app.api.verifiable_credentials.resources.verifiable_credential_connections import VerifiableCredentialConnectionResource
from app.api.verifiable_credentials.resources.verifiable_credential_webhook import VerifiableCredentialWebhookResource

api = Namespace('verifiable-credentials', description='Variances actions/options')

api.add_resource(VerifiableCredentialResource, '')
api.add_resource(VerifiableCredentialWebhookResource, '/webhook/topic/<string:topic>/')
api.add_resource(VerifiableCredentialConnectionResource, '/oob-invitation/<string:party_guid>')

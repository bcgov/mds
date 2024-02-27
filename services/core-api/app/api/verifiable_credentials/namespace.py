from flask_restx import Namespace

from app.api.verifiable_credentials.resources.verifiable_credential import VerifiableCredentialResource
from app.api.verifiable_credentials.resources.verifiable_credential_connections import VerifiableCredentialConnectionResource
from app.api.verifiable_credentials.resources.verifiable_credential_webhook import VerifiableCredentialWebhookResource
from app.api.verifiable_credentials.resources.verifiable_credential_map import VerifiableCredentialMinesActPermitResource
from app.api.verifiable_credentials.resources.verifiable_credential_revocation import VerifiableCredentialRevocationResource

api = Namespace('verifiable-credentials', description='Variances actions/options')

api.add_resource(VerifiableCredentialResource, '')
api.add_resource(VerifiableCredentialWebhookResource, '/webhook/topic/<string:topic>/')

api.add_resource(VerifiableCredentialConnectionResource, '/<string:party_guid>/oob-invitation')
api.add_resource(VerifiableCredentialMinesActPermitResource, '/<string:party_guid>/mines-act-permits')

api.add_resource(VerifiableCredentialRevocationResource, '/<string:party_guid>/mines-act-permits/revoke')

from flask_restx import Namespace

from app.api.verifiable_credentials.resources.verifiable_credential import VerifiableCredentialResource
from app.api.verifiable_credentials.resources.verifiable_credential_connections import VerifiableCredentialConnectionResource
from app.api.verifiable_credentials.resources.verifiable_credential_webhook import VerifiableCredentialWebhookResource
from app.api.verifiable_credentials.resources.verifiable_credential_map import VerifiableCredentialMinesActPermitResource
from app.api.verifiable_credentials.resources.verifiable_credential_map_detail import VerifiableCredentialCredentialExchangeResource
from app.api.verifiable_credentials.resources.verifiable_credential_revocation import VerifiableCredentialRevocationResource
from app.api.verifiable_credentials.resources.w3c_map_credential_resource import W3CCredentialResource, W3CCredentialListResource, W3CCredentialDeprecatedResource

api = Namespace('verifiable-credentials', description='Variances actions/options')

api.add_resource(VerifiableCredentialResource, '')
api.add_resource(VerifiableCredentialWebhookResource, '/webhook/topic/<string:topic>/')

api.add_resource(VerifiableCredentialConnectionResource, '/<string:party_guid>/oob-invitation')
api.add_resource(VerifiableCredentialMinesActPermitResource,
                 '/<string:party_guid>/mines-act-permits')
api.add_resource(VerifiableCredentialCredentialExchangeResource,
                 '/<string:party_guid>/mines-act-permits/<string:cred_exch_id>/details')

api.add_resource(VerifiableCredentialRevocationResource,
                 '/<string:party_guid>/mines-act-permits/revoke')

api.add_resource(W3CCredentialResource, '/credentials/<string:vc_guid>')
api.add_resource(W3CCredentialListResource, '/credentials')
api.add_resource(W3CCredentialDeprecatedResource, '/credentials/deprecated')

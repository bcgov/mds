from flask import current_app
from flask_restx import Resource
from werkzeug.exceptions import NotFound, NotImplemented
from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, EDIT_PARTY, MINESPACE_PROPONENT

from app.api.parties.party.models.party import Party
from app.api.verifiable_credentials.models.connection import PartyVerifiableCredentialConnection
from app.api.services.traction_service import TractionService
from app.api.verifiable_credentials.response_models import PARTY_VERIFIABLE_CREDENTIAL_CONNECTION
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.feature_flag import Feature, is_feature_enabled


class VerifiableCredentialConnectionResource(Resource, UserMixin):

    @api.doc(description='Delete a connection party by connection_id', params={})
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    def delete(self, connection_id: str):
        if not is_feature_enabled(Feature.TRACTION_VERIFIABLE_CREDENTIALS):
            raise NotImplemented()

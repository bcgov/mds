from flask import current_app
from flask_restx import Resource
from werkzeug.exceptions import BadRequest
from app.extensions import api
from app.api.utils.access_decorators import requires_any_of, EDIT_PARTY, MINESPACE_PROPONENT

from app.api.verifiable_credentials.models.connection import PartyVerifiableCredentialConnection
from app.api.services.traction_service import TractionService
from app.api.utils.resources_mixins import UserMixin


class VerifiableCredentialConnectionResource(Resource, UserMixin):

    @api.doc(description='Delete a connection party by connection_id', params={})
    @requires_any_of([EDIT_PARTY, MINESPACE_PROPONENT])
    def delete(self, party_guid: str):

        active_conn = PartyVerifiableCredentialConnection.find_active_by_party_guid(party_guid)
        conns = PartyVerifiableCredentialConnection.find_by_party_guid(party_guid)
        if not active_conn:
            raise BadRequest(f"party has no active connection party_guid={party_guid}")

        # this will hard delete the didcomm connection, but will maintain the CORE records of anything that was exchanged on that connection
        active_conn.delete()

        t_service = TractionService()
        delete_success = t_service.delete_connection(active_conn.connection_id)
        assert delete_success

        active_conn.save()

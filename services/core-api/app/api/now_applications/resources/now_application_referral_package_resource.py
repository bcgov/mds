import uuid

from flask import request
from flask_restx import Resource
from werkzeug.exceptions import BadRequest, NotFound, ServiceUnavailable

from app.extensions import api
from app.api.utils.access_decorators import requires_role_edit_permit, requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.feature_flag import Feature, is_feature_enabled
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity
from app.api.now_applications.models.now_application_referral_package import NOWApplicationReferralPackage
from app.api.now_applications.response_models import NOW_APPLICATION_REFERRAL_PACKAGE


def _belongs_to_application(mine_document, now_application_id):
    xref = mine_document.now_application_document_xref or mine_document.now_application_document_identity_xref
    return xref is not None and xref.now_application_id == now_application_id


class NOWApplicationReferralPackageListResource(Resource, UserMixin):
    @api.doc(description='Retrieve referral packages for a Notice of Work application')
    @requires_role_view_all
    @api.marshal_with(NOW_APPLICATION_REFERRAL_PACKAGE, envelope='records', code=200)
    def get(self, application_guid):
        if not is_feature_enabled(Feature.NOW_FILE_MANAGEMENT):
            raise ServiceUnavailable()

        now_application_identity = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application_identity:
            raise NotFound('No notice of work application identity found for this guid.')
        if not now_application_identity.now_application_id:
            raise BadRequest('Notice of work application not imported, call import endpoint first.')

        return NOWApplicationReferralPackage.find_by_now_application_id(
            now_application_identity.now_application_id)

    @api.doc(description='Create a new referral package snapshot for a Notice of Work application')
    @requires_role_edit_permit
    @api.marshal_with(NOW_APPLICATION_REFERRAL_PACKAGE, code=201)
    def post(self, application_guid):
        if not is_feature_enabled(Feature.NOW_FILE_MANAGEMENT):
            raise ServiceUnavailable()

        now_application_identity = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application_identity:
            raise NotFound('No notice of work application identity found for this guid.')
        if not now_application_identity.now_application_id:
            raise BadRequest('Notice of work application not imported, call import endpoint first.')

        data = request.json or {}
        mine_document_guids = data.get('mine_document_guids', [])
        if not isinstance(mine_document_guids, list) or not mine_document_guids:
            raise BadRequest('At least one document is required to create a referral package.')

        mine_documents = []
        for guid in dict.fromkeys(mine_document_guids):
            try:
                uuid.UUID(str(guid))
            except ValueError:
                raise BadRequest(f'Invalid mine_document_guid: {guid}')
            mine_document = MineDocument.find_by_mine_document_guid(guid)
            if not mine_document or not _belongs_to_application(
                    mine_document, now_application_identity.now_application_id):
                raise NotFound('No mine_document found for this application guid.')
            mine_documents.append(mine_document)

        package = NOWApplicationReferralPackage.create(
            now_application_identity.now_application, mine_documents)
        return package, 201

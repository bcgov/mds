import uuid

from flask import request
from werkzeug.exceptions import BadRequest, NotFound, ServiceUnavailable

from app.api.utils.feature_flag import Feature, is_feature_enabled
from app.api.mines.documents.models.mine_document import MineDocument
from app.api.now_applications.models.now_application_identity import NOWApplicationIdentity


def _belongs_to_application(mine_document, now_application_id):
    xref = mine_document.now_application_document_xref or mine_document.now_application_document_identity_xref
    return xref is not None and xref.now_application_id == now_application_id


class PackageListResourceMixin:
    """
    Shared handling for the package list endpoints (e.g. Referral, Consultation). Subclasses declare the decorated
    get/post methods, and set `package_model` and `package_label` (lowercase, e.g. 'referral').
    """
    package_model = None
    package_label = None

    def _get_imported_identity(self, application_guid):
        if not is_feature_enabled(Feature.NOW_FILE_MANAGEMENT):
            raise ServiceUnavailable()

        now_application_identity = NOWApplicationIdentity.find_by_guid(application_guid)
        if not now_application_identity:
            raise NotFound('No notice of work application identity found for this guid.')
        if not now_application_identity.now_application_id:
            raise BadRequest('Notice of work application not imported, call import endpoint first.')
        return now_application_identity

    def _list_packages(self, application_guid):
        now_application_identity = self._get_imported_identity(application_guid)
        return self.package_model.find_by_now_application_id(now_application_identity.now_application_id)

    def _create_package(self, application_guid):
        now_application_identity = self._get_imported_identity(application_guid)

        data = request.json or {}
        mine_document_guids = data.get('mine_document_guids', [])
        if not isinstance(mine_document_guids, list) or not mine_document_guids:
            raise BadRequest(f'At least one document is required to create a {self.package_label} package.')

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

        package = self.package_model.create(now_application_identity.now_application, mine_documents)
        return package, 201

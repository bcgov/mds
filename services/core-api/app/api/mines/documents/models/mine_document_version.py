import random
import uuid
import json
from app.api.services.document_manager_service import DocumentManagerService
from flask import request

from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from datetime import datetime
from marshmallow import fields
from app.config import Config
from app.api.utils.include.user_info import User

from app.extensions import db
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from sqlalchemy.ext.hybrid import hybrid_property


class MineDocumentVersion(SoftDeleteMixin, AuditMixin, Base):

    __tablename__ = 'mine_document_version'

    mine_document_version_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('mine_document.mine_document_guid'), nullable=False)
    document_manager_version_guid = db.Column(UUID(as_uuid=True), nullable=False)
    upload_date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    document_name = db.Column(db.String(255), nullable=False)

    @classmethod
    def create_from_docman_version(
        self,
        mine_document,
        document_manager_version_guid,
        commit=True
    ):
        """
        Archives the file mine_document currently points to as a MineDocumentVersion, using
        mine_document's create_user/create_timestamp for that file (who uploaded it, and when) rather than the person/time of this replace. mine_document is
        then updated to point at the newly uploaded file, using docman's own record of the
        document (the source of truth, since docman already applied the rename on upload)
        rather than anything supplied by the client.
        """
        docman_version = DocumentManagerService.get_document_version(
            request=request,
            document_manager_guid=mine_document.document_manager_guid,
            document_manager_version_guid=document_manager_version_guid,
        )

        new_version = MineDocumentVersion(
            mine_document_guid=mine_document.mine_document_guid,
            document_manager_version_guid=document_manager_version_guid,
            document_name=docman_version.get('file_display_name'),
            upload_date=mine_document.upload_date,
        )
        new_version.create_user = mine_document.create_user
        new_version.create_timestamp = mine_document.create_timestamp
        new_version.update_user = new_version.create_user
        new_version.update_timestamp = new_version.create_timestamp

        new_version.save(commit=False)

        docman_document = DocumentManagerService.get_document(
            request=request,
            document_manager_guid=mine_document.document_manager_guid,
        )
        new_filename = docman_document.get('file_display_name')
        if new_filename:
            mine_document.document_name = new_filename
        # create_user/create_timestamp/upload_date track who uploaded the file the document currently points to, and when
        mine_document.create_user = User().get_user_username()
        mine_document.create_timestamp = datetime.utcnow()
        mine_document.upload_date = mine_document.create_timestamp
        mine_document.save(commit=commit)

        return new_version.json(mine_document.mine_guid, mine_document.document_manager_guid)

    def __repr__(self):
        return '<MineDocumentVersion %r>' % self.mine_document_guid

    def json(self, mine_guid=None, document_manager_guid=None):
        return {
            'mine_document_version_guid': str(self.mine_document_version_guid),
            'mine_document_guid': str(self.mine_document_guid),
            'document_manager_version_guid': str(self.document_manager_version_guid),
            'upload_date': str(self.upload_date),
            'document_name': str(self.document_name),
            'create_user': str(self.create_user),
            'update_user': str(self.update_user),
            'update_timestamp': str(self.update_timestamp),
            'mine_guid': str(mine_guid) if mine_guid else None,
            'document_manager_guid': str(document_manager_guid) if document_manager_guid else None,
        }

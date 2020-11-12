from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import backref
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db
from app.api.constants import *
from app.api.mines.documents.models.mine_document import MineDocument


class NOWApplicationDocumentIdentityXref(AuditMixin, Base):
    __tablename__ = 'now_application_document_identity_xref'
    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]

    now_application_document_xref_guid = db.Column(
        UUID(as_uuid=True), server_default=FetchedValue())
    mine_document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('mine_document.mine_document_guid'))

    filename = db.Column(db.String, primary_key=True)
    messageid = db.Column(db.Integer, primary_key=True)
    documenturl = db.Column(db.String, primary_key=True)
    documenttype = db.Column(db.String, primary_key=True)
    description = db.Column(db.String)
    is_final_package = db.Column(db.Boolean, server_default=FetchedValue())

    now_application_id = db.Column(
        db.Integer,
        db.ForeignKey('now_application.now_application_id'),
        server_default=FetchedValue())

    mine_document = db.relationship(
        'MineDocument',
        lazy='joined',
        backref=backref('now_application_document_identity_xref', uselist=False))

    @hybrid_property
    def document_manager_guid(self):
        return self.mine_document.document_manager_guid

    def __repr__(self):
        return '<NOWApplicationDocumentIdentityXref %r>' % self.now_application_document_xref_guid

    @classmethod
    def create(cls, mine_guid, now_application_id, document_manager_document_guid, message_id,
               document_url, file_name, document_type, description):

        new_document_identity_xref = cls(
            messageid=message_id,
            documenturl=document_url,
            documenttype=document_type,
            description=description,
            filename=file_name,
            now_application_id=now_application_id,
            mine_document=MineDocument(
                mine_guid=mine_guid,
                document_manager_guid=document_manager_document_guid,
                document_name=file_name))

        new_document_identity_xref.save()
        return new_document_identity_xref
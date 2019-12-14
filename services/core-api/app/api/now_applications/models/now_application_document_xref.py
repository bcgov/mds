from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db


class NOWApplicationDocumentXref(AuditMixin, Base):
    __tablename__ = "now_application_document_xref"

    now_application_document_xref_guid = db.Column(UUID(as_uuid=True),
                                                   primary_key=True,
                                                   server_default=FetchedValue())
    mine_document_guid = db.Column(UUID(as_uuid=True),
                                   db.ForeignKey('mine_document.mine_document_guid'))
    now_application_id = db.Column(db.Integer,
                                   db.ForeignKey('now_application.now_application_id'),
                                   server_default=FetchedValue())
    now_application_document_type_code = db.Column(
        db.String,
        db.ForeignKey('now_application_document_type.now_application_document_type_code'))

    description = db.Column(db.String)
    is_final_package = db.Column(db.Boolean)

    # NOWApplicationDocumentType
    now_application_document_type = db.relationship('NOWApplicationDocumentType', lazy='joined')
    now_application_document_type_code_description = association_proxy('now_application_document_type', 'description')

    # MineDocument
    mine_document = db.relationship('MineDocument', lazy='joined')
    mine_guid = association_proxy('mine_document', 'mine_guid')
    document_manager_guid = association_proxy('mine_document', 'document_manager_guid')
    document_name = association_proxy('mine_document', 'document_name')
    upload_date = association_proxy('mine_document', 'upload_date')

    def __repr__(self):
        return '<ApplicationDocumentXref %r>' % self.application_document_xref_guid

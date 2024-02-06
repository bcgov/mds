from sqlalchemy.dialects.postgresql import UUID, dialect
from sqlalchemy.schema import FetchedValue, CreateTable
from sqlalchemy.ext.associationproxy import association_proxy
from enum import Enum, auto
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.extensions import db


class DocumentType(Enum):
    checklist = auto()
    other = auto()
    decision = auto()


class NoticeOfDepartureDocumentXref(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = "notice_of_departure_document_xref"
    nod_xref_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('mine_document.mine_document_guid'), nullable=False)
    nod_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('notice_of_departure.nod_guid'),
        server_default=FetchedValue())
    document_type = db.Column(db.Enum(DocumentType), nullable=False, default=DocumentType.checklist)
    mine_document = db.relationship('MineDocument', lazy='joined', overlaps="mine_documents,notice_of_departure")

    mine_guid = association_proxy('mine_document', 'mine_guid')
    document_manager_guid = association_proxy('mine_document', 'document_manager_guid')
    document_name = association_proxy('mine_document', 'document_name')

    def __repr__(self):
        return '<NoticeOfDepartureDocumentXref %r>' % self.nod_xref_guid

    @classmethod
    def find(cls, __guid):
        return cls.query.filter_by(nod_xref_guid=__guid, deleted_ind=False).first()

    @classmethod
    def find_by_docman_guid(cls, __guid):
        return cls.query.filter_by(document_manager_guid=__guid, deleted_ind=False).first()

    def delete(self):
        self.mine_document.deleted_ind = True
        super(NoticeOfDepartureDocumentXref, self).delete()

    @classmethod
    def delete_current_checklist(cls, nod_guid):
        checklist = cls.query.filter_by(
            nod_guid=nod_guid, deleted_ind=False, document_type='checklist').first()
        if checklist:
            checklist.delete()

    @classmethod
    def delete_current_decision(cls, nod_guid):
        decision = cls.query.filter_by(
            nod_guid=nod_guid, deleted_ind=False, document_type='decision').first()
        if decision:
            decision.delete()

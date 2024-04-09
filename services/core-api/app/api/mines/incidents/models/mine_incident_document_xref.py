from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db


class MineIncidentDocumentXref(Base):
    __tablename__ = "mine_incident_document_xref"
    mine_incident_document_xref_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('mine_document.mine_document_guid'))
    mine_incident_id = db.Column(
        db.Integer, db.ForeignKey('mine_incident.mine_incident_id'), server_default=FetchedValue())
    mine_incident_document_type_code = db.Column(
        db.String,
        db.ForeignKey('mine_incident_document_type_code.mine_incident_document_type_code'),
        nullable=False)
    mine_document = db.relationship('MineDocument', lazy='joined', overlaps="mine_documents")

    mine_guid = association_proxy('mine_document', 'mine_guid')
    document_manager_guid = association_proxy('mine_document', 'document_manager_guid')
    document_name = association_proxy('mine_document', 'document_name')
    upload_date = association_proxy('mine_document', 'upload_date')
    update_user = association_proxy('mine_document', 'update_user')
    deleted_ind = association_proxy('mine_document', 'deleted_ind')

    def __repr__(self):
        return '<MineIncidentDocumentXref %r>' % self.mine_incident_document_xref_guid

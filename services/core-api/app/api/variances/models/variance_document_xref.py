from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db


class VarianceDocumentXref(Base):
    __tablename__ = "variance_document_xref"
    variance_document_xref_guid = db.Column(UUID(as_uuid=True),
                                            primary_key=True,
                                            server_default=FetchedValue())
    mine_document_guid = db.Column(UUID(as_uuid=True),
                                   db.ForeignKey('mine_document.mine_document_guid'))
    variance_id = db.Column(db.Integer,
                            db.ForeignKey('variance.variance_id'),
                            server_default=FetchedValue())
    variance_document_category_code = db.Column(
        db.String,
        db.ForeignKey('variance_document_category_code.variance_document_category_code'),
        nullable=False)
    created_at = db.Column(db.DateTime, server_default=FetchedValue())

    mine_document = db.relationship('MineDocument', lazy='joined')

    mine_guid = association_proxy('mine_document', 'mine_guid')
    document_manager_guid = association_proxy('mine_document', 'document_manager_guid')
    document_name = association_proxy('mine_document', 'document_name')

    def __repr__(self):
        return '<VarianceDocumentXref %r>' % self.variance_document_xref_guid

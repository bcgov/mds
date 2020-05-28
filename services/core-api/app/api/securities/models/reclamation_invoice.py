from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from marshmallow import fields

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.securities.models.reclamation_invoice_document import ReclamationInvoiceDocument


class ReclamationInvoice(Base, AuditMixin):
    __tablename__ = "reclamation_invoice"

    class _ModelSchema(Base._ModelSchema):
        reclamation_invoice_id = fields.Integer(dump_only=True)
        reclamation_invoice_guid = fields.String(dump_only=True)

    reclamation_invoice_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    reclamation_invoice_guid = db.Column(
        UUID(as_uuid=True), nullable=False, unique=True, server_default=FetchedValue())
    permit_id = db.Column(db.Integer, db.ForeignKey('permit.permit_id'))
    project_id = db.Column(db.String, nullable=False)
    amount = db.Column(db.Numeric(14, 2), nullable=False)
    vendor = db.Column(db.String, nullable=False)
    note = db.Column(db.String)

    permit = db.relationship('Permit', lazy='joined')
    documents = db.relationship('ReclamationInvoiceDocument', lazy='select')

    def __repr__(self):
        return '<ReclamationInvoice %r>' % self.reclamation_invoice_guid

    @classmethod
    def find_by_reclamation_invoice_guid(cls, reclamation_invoice_guid):
        return cls.query.filter_by(reclamation_invoice_guid=reclamation_invoice_guid).first()

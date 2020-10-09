from app.extensions import db
from marshmallow import fields
from app.api.utils.models_mixins import Base
from sqlalchemy.dialects.postgresql import UUID
from app.api.mines.documents.models.mine_document import MineDocument


class ReclamationInvoiceDocument(MineDocument):
    __tablename__ = "reclamation_invoice_document_xref"
    __mapper_args__ = {'polymorphic_identity': 'reclamation_invoice'}

    class _ModelSchema(Base._ModelSchema):
        mine_document_guid = fields.UUID(dump_only=True)

    mine_document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('mine_document.mine_document_guid'), primary_key=True)
    reclamation_invoice_id = db.Column(db.Integer,
                                       db.ForeignKey('reclamation_invoice.reclamation_invoice_id'))

    reclamation_invoice = db.relationship('ReclamationInvoice', lazy='joined')
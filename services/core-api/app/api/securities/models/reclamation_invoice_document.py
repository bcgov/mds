from app.extensions import db
from app.api.mines.documents.models.mine_document import MineDocument


class ReclamationInvoiceDocument(MineDocument):
    __tablename__ = "reclamation_invoice_document_xref"
    __create_schema__ = True
    __mapper_args__ = {'polymorphic_identity': 'reclamation_invoice'}

    mine_document_id = db.Column(
        db.Integer,
        db.ForeignKey('mine_document.mine_document_id'),
        nullable=False,
        primary_key=True)
    reclamation_invoice_id = db.Column(db.Integer,
                                       db.ForeignKey('reclamation_invoice.reclamation_invoice_id'))

    reclamation_invoice = db.relationship('ReclamationInvoice', lazy='joined')
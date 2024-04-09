
from app.extensions import db
from app.api.mines.documents.models.mine_document import MineDocument


class ReclamationInvoiceDocument(MineDocument):
    __create_schema__ = True
    __mapper_args__ = {
        'polymorphic_identity': 'reclamation_invoice'
    }

    reclamation_invoice_id = db.Column(db.Integer, db.ForeignKey('reclamation_invoice.reclamation_invoice_id'))

    reclamation_invoice = db.relationship('ReclamationInvoice', lazy='joined', back_populates='documents')
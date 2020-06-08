from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin


class BondDocumentType(Base, AuditMixin):
    __tablename__ = "bond_document_type"

    bond_document_type_code = db.Column(db.String, nullable=False, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    display_order = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return '<BondDocumentType %r>' % self.bond_document_type_code

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active_ind=True).order_by(cls.display_order).all()

from marshmallow import fields

from app.extensions import db
from app.api.utils.models_mixins import Base
from app.api.utils.field_template import FieldTemplate
from app.api.mines.documents.models.mine_document import MineDocument


class BondDocument(MineDocument):
    __tablename__ = "bond_document_xref"
    __create_schema__ = True
    __mapper_args__ = {
        'polymorphic_identity': 'bond',
    }

    class _ModelSchema(Base._ModelSchema):
        bond_document_type_code = FieldTemplate(field=fields.String, one_of='BondDocumentType')

    mine_document_id = db.Column(
        db.Integer,
        db.ForeignKey('mine_document.mine_document_id'),
        nullable=False,
        primary_key=True)
    bond_id = db.Column(db.Integer, db.ForeignKey('bond.bond_id'))
    bond_document_type_code = db.Column(
        db.String, db.ForeignKey('bond_document_type.bond_document_type_code'), nullable=False)

    bond = db.relationship('Bond', lazy='joined')
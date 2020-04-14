import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from marshmallow import fields, validate

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.utils.field_template import FieldTemplate
from app.api.securities.models.bond_document import BondDocument


class Bond(Base, AuditMixin):
    __tablename__ = "bond"

    class _ModelSchema(Base._ModelSchema):
        bond_id = fields.Integer(dump_only=True)
        bond_guid = fields.String(dump_only=True)
        bond_type_code = FieldTemplate(field=fields.String, one_of='BondType')
        bond_status_code = FieldTemplate(field=fields.String, one_of='BondStatus')

    bond_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    bond_guid = db.Column(
        UUID(as_uuid=True), nullable=False, unique=True, server_default=FetchedValue())
    amount = db.Column(db.Numeric(14, 2), nullable=False)
    bond_type_code = db.Column(db.String, db.ForeignKey('bond_type.bond_type_code'))
    issue_date = db.Column(db.DateTime)
    payer_party_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=False)
    bond_status_code = db.Column(db.String, db.ForeignKey('bond_status.bond_status_code'))
    reference_number = db.Column(db.String)
    institution_name = db.Column(db.String)
    institution_street = db.Column(db.String)
    institution_city = db.Column(db.String)
    institution_province = db.Column(db.String,
                                     db.ForeignKey('sub_division_code.sub_division_code'))
    institution_postal_code = db.Column(db.String)
    note = db.Column(db.String)
    project_id = db.Column(db.String)

    payer = db.relationship('Party', lazy='joined')
    permit = db.relationship('Permit', uselist=False, lazy='joined', secondary='bond_permit_xref')
    documents = db.relationship('BondDocument', lazy='select')

    def __repr__(self):
        return '<Bond %r>' % self.bond_guid

    @classmethod
    def find_by_bond_guid(cls, bond_guid):
        return cls.query.filter_by(bond_guid=bond_guid).first()

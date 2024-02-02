import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from marshmallow import fields, validate
from flask_restx import marshal
from flask import current_app

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.utils.field_template import FieldTemplate
from app.api.securities.models.bond_document import BondDocument
from app.api.securities.models.bond_history import BondHistory
from app.api.securities.response_models import BOND


class Bond(Base, AuditMixin):
    __tablename__ = "bond"

    class _ModelSchema(Base._ModelSchema):
        bond_id = fields.Integer(dump_only=True)
        bond_guid = fields.UUID(dump_only=True)
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

    payer = db.relationship('Party', lazy='joined')
    permit = db.relationship('Permit', uselist=False, lazy='joined', secondary='bond_permit_xref')
    documents = db.relationship('BondDocument', lazy='select')
    closed_date = db.Column(db.DateTime)
    closed_note = db.Column(db.String)

    def __repr__(self):
        return '<Bond %r>' % self.bond_guid

    def save_bond_history(self):
        bond_json = marshal(self, BOND)
        del bond_json['bond_guid']
        del bond_json['documents']
        bond_json['payer_name'] = bond_json['payer']['party_name']
        bond_json['update_timestamp'] = str(self.update_timestamp)
        bond_json['update_user'] = self.update_user

        current_app.logger.debug(bond_json)
        bond_hist = BondHistory._schema().load(bond_json)
        bond_hist.save()
        return bond_hist

    @classmethod
    def find_by_bond_guid(cls, bond_guid):
        return cls.query.filter_by(bond_guid=bond_guid).first()

    @classmethod
    def find_by_payer_party_guid(cls, payer_party_guid):
        return cls.query.filter_by(payer_party_guid=payer_party_guid).all()

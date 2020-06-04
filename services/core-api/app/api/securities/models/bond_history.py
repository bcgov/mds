import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from marshmallow import fields, validate

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.utils.field_template import FieldTemplate


class BondHistory(Base, AuditMixin):
    __tablename__ = "bond_history"

    bond_history_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    bond_id = db.Column(db.Integer, db.ForeignKey('bond.bond_id'), nullable=False)
    amount = db.Column(db.Numeric(14, 2), nullable=False)
    bond_type_code = db.Column(db.String)
    issue_date = db.Column(db.DateTime)
    payer_party_guid = db.Column(UUID(as_uuid=True), nullable=False)
    bond_status_code = db.Column(db.String)
    reference_number = db.Column(db.String)
    institution_name = db.Column(db.String)
    institution_street = db.Column(db.String)
    institution_city = db.Column(db.String)
    institution_province = db.Column(db.String)
    institution_postal_code = db.Column(db.String)
    note = db.Column(db.String)
    project_id = db.Column(db.String)

    def __repr__(self):
        return '<BondHistory %r>' % self.bond_id

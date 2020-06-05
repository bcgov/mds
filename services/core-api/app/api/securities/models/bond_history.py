import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from marshmallow import fields, validate
from datetime import datetime

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.utils.field_template import FieldTemplate
from app.api.utils.include.user_info import User


class BondHistory(Base):
    __tablename__ = "bond_history"

    bond_history_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    bond_id = db.Column(db.Integer, db.ForeignKey('bond.bond_id'), nullable=False)
    amount = db.Column(db.Numeric(14, 2), nullable=False)
    bond_type_code = db.Column(db.String)
    issue_date = db.Column(db.DateTime)
    permit_no = db.Column(db.String)
    permit_guid = db.Column(UUID(as_uuid=True))
    payer = db.Column(db.String)
    payer_party_guid = db.Column(UUID(as_uuid=True))
    bond_status_code = db.Column(db.String)
    reference_number = db.Column(db.String)
    institution_name = db.Column(db.String)
    institution_street = db.Column(db.String)
    institution_city = db.Column(db.String)
    institution_province = db.Column(db.String)
    institution_postal_code = db.Column(db.String)
    note = db.Column(db.String)
    project_id = db.Column(db.String)
    update_user = db.Column(
        db.String,
        nullable=False,
        default=User().get_user_username,
        onupdate=User().get_user_username)
    update_timestamp = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return '<BondHistory %r>' % self.bond_id

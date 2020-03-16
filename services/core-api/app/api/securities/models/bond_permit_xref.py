import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import Base


class BondPermitXref(Base):
    __tablename__ = "bond_permit_xref"

    bond_permit_xref_guid = db.Column(
        UUID(as_uuid=True), server_default=FetchedValue(), primary_key=True)
    bond_id = db.Column(db.Integer, db.ForeignKey('bond.bond_id'))
    permit_id = db.Column(db.Integer, db.ForeignKey('permit.permit_id'))

    def __repr__(self):
        return '<BondPermitXref %r>' % self.bond_permit_xref_guid

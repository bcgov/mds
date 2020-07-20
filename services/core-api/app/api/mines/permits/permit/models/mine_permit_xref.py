from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db


class MinePermitXref(Base, AuditMixin):
    __tablename__ = "mine_permit_xref"

    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), primary_key=True)
    permit_id = db.Column(db.Integer, db.ForeignKey('permit.permit_id'), primary_key=True)

    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime)
    deleted_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
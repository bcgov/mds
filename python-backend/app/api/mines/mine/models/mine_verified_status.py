import uuid

from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base


class MineVerifiedStatus(AuditMixin, Base):
    __tablename__ = 'mine_verified_status'

    mine_verified_status_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    active_ind = db.Column(db.Boolean, nullable=False)
    verifying_user = db.Column(db.String, nullable=False)
    verifying_timestamp = db.Column(db.DateTime, nullable=False)

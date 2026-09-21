from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base


class MinespaceUserRoleXref(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'minespace_user_role_xref'

    minespace_user_role_xref_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    minespace_user_role_code = db.Column(
        db.String(3), db.ForeignKey('minespace_user_role.minespace_user_role_code'), nullable=False)
    minespace_user_id = db.Column(
        db.Integer, db.ForeignKey('minespace_user.user_id'), nullable=False)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)
    is_pending = db.Column(db.Boolean, nullable=False)

    minespace_user_role = db.relationship('MinespaceUserRole', lazy='joined')
    mine = db.relationship('Mine', lazy='select')
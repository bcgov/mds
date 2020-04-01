from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base
from .mine_operation_status_code import MineOperationStatusCode
from .mine_operation_status_reason_code import MineOperationStatusReasonCode
from .mine_operation_status_sub_reason_code import MineOperationStatusSubReasonCode


class MineStatusXref(AuditMixin, Base):
    __tablename__ = 'mine_status_xref'
    mine_status_xref_guid = db.Column(UUID(as_uuid=True), primary_key=True)

    mine_operation_status_code = db.Column(
        db.String(3), db.ForeignKey('mine_operation_status_code.mine_operation_status_code'))
    mine_operation_status = db.relationship('MineOperationStatusCode', lazy='joined')

    mine_operation_status_reason_code = db.Column(
        db.String(3),
        db.ForeignKey('mine_operation_status_reason_code.mine_operation_status_reason_code'))
    mine_operation_status_reason = db.relationship('MineOperationStatusReasonCode', lazy='joined')

    mine_operation_status_sub_reason_code = db.Column(
        db.String(3),
        db.ForeignKey(
            'mine_operation_status_sub_reason_code.mine_operation_status_sub_reason_code'))
    mine_operation_status_sub_reason = db.relationship(
        'MineOperationStatusSubReasonCode', lazy='joined')
    description = db.Column(db.String(1024))

    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<MineStatusXref %r>' % self.mine_status_xref_guid

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active_ind=True).all()

    @classmethod
    def find_by_mine_status_xref_guid(cls, _id):
        return cls.query.filter_by(mine_status_xref_guid=_id).first()

    @classmethod
    def find_by_codes(cls,
                      _mine_operation_status_code,
                      _mine_operation_status_reason_code=None,
                      _mine_operation_status_sub_reason_code=None):
        xref_query = cls.query \
            .filter_by(mine_operation_status_code=_mine_operation_status_code) \
            .order_by(
                cls.mine_operation_status_reason_code.desc(),
                cls.mine_operation_status_sub_reason_code.desc())
        if _mine_operation_status_reason_code:
            xref_query = xref_query.filter_by(
                mine_operation_status_reason_code=_mine_operation_status_reason_code)
        if _mine_operation_status_sub_reason_code:
            xref_query = xref_query.filter_by(
                mine_operation_status_sub_reason_code=_mine_operation_status_sub_reason_code)
        return xref_query.first()

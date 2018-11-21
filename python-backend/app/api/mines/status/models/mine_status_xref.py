from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base
from .mine_operation_status_code import MineOperationStatusCode
from .mine_operation_status_reason_code import MineOperationStatusReasonCode
from .mine_operation_status_sub_reason_code import MineOperationStatusSubReasonCode

class MineStatusXref(AuditMixin, Base):
    __tablename__ = 'mine_status_xref'
    mine_status_xref_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_operation_status_code = db.Column(db.String(3), db.ForeignKey('mine_operation_status_code.mine_operation_status_code'))
    mine_operation_status_reason_code = db.Column(db.String(3), db.ForeignKey('mine_operation_status_reason_code.mine_operation_status_reason_code'))
    mine_operation_status_sub_reason_code = db.Column(db.String(3), db.ForeignKey('mine_operation_status_sub_reason_code.mine_operation_status_sub_reason_code'))
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    def __repr__(self):
        return '<MineStatusXref %r>' % self.mine_status_xref_guid

    def json(self):
        mine_operation_status_code = MineOperationStatusCode.find_by_mine_operation_status_code(self.mine_operation_status_code)
        mine_operation_status_reason_code = MineOperationStatusReasonCode.find_by_mine_operation_status_reason_code(self.mine_operation_status_reason_code)
        mine_operation_status_sub_reason_code = MineOperationStatusSubReasonCode.find_by_mine_operation_status_sub_reason_code(self.mine_operation_status_sub_reason_code)
        return {
            'mine_status_xref_guid': str(self.mine_status_xref_guid),
            'mine_operation_status_code': mine_operation_status_code.json() if mine_operation_status_code else {},
            'mine_operation_status_reason_code': mine_operation_status_reason_code.json() if mine_operation_status_reason_code else {},
            'mine_operation_status_sub_reason_code': mine_operation_status_sub_reason_code.json() if mine_operation_status_sub_reason_code else {},
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat()
        }

    @classmethod
    def find_by_mine_status_xref_guid(cls, _id):
        return cls.query.filter_by(mine_status_xref_guid=_id).first()

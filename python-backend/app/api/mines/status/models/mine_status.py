from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base
from .mine_status_xref import MineStatusXref


class MineStatus(AuditMixin, Base):
    __tablename__ = 'mine_status'
    mine_status_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    mine_status_xref_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('mine_status_xref.mine_status_xref_guid'))
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(
        db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<MineStatus %r>' % self.mine_status

    def validate_status_code_exists(self, mine_status_xref, mine_status_code, code_or_description):
        try:
            return mine_status_xref[mine_status_code][code_or_description]
        except KeyError:
            return None

    def create_mine_status_values_list(self, mine_status_xref):
        status_values_list = []
        _mine_operation_status_code = self.validate_status_code_exists(
            mine_status_xref, 'mine_operation_status_code', 'mine_operation_status_code')
        _mine_operation_status_reason_code = self.validate_status_code_exists(
            mine_status_xref, 'mine_operation_status_reason_code',
            'mine_operation_status_reason_code')
        _mine_operation_status_sub_reason_code = self.validate_status_code_exists(
            mine_status_xref, 'mine_operation_status_sub_reason_code',
            'mine_operation_status_sub_reason_code')
        if _mine_operation_status_code:
            status_values_list.append(_mine_operation_status_code)
        if _mine_operation_status_reason_code:
            status_values_list.append(_mine_operation_status_reason_code)
        if _mine_operation_status_sub_reason_code:
            status_values_list.append(_mine_operation_status_sub_reason_code)
        return status_values_list

    def create_mine_status_labels_list(self, mine_status_xref):
        status_labels_list = []
        _mine_operation_status_code = self.validate_status_code_exists(
            mine_status_xref, 'mine_operation_status_code', 'description')
        _mine_operation_status_reason_code = self.validate_status_code_exists(
            mine_status_xref, 'mine_operation_status_reason_code', 'description')
        _mine_operation_status_sub_reason_code = self.validate_status_code_exists(
            mine_status_xref, 'mine_operation_status_sub_reason_code', 'description')
        if _mine_operation_status_code:
            status_labels_list.append(_mine_operation_status_code)
        if _mine_operation_status_reason_code:
            status_labels_list.append(_mine_operation_status_reason_code)
        if _mine_operation_status_sub_reason_code:
            status_labels_list.append(_mine_operation_status_sub_reason_code)
        return status_labels_list

    def json(self, show_mgr=True):
        mine_status_xref_json = MineStatusXref.find_by_mine_status_xref_guid(
            self.mine_status_xref_guid).json()
        status_values_list = self.create_mine_status_values_list(mine_status_xref_json)
        status_labels_list = self.create_mine_status_labels_list(mine_status_xref_json)
        return {
            'mine_status_guid': str(self.mine_status_guid),
            'mine_guid': str(self.mine_guid),
            'mine_status_xref_guid': str(self.mine_status_xref_guid),
            'status_values': status_values_list,
            'status_labels': status_labels_list,
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat()
        }

    @classmethod
    def find_by_mine_status_guid(cls, _id):
        return cls.query.filter_by(mine_status_guid=_id).first()

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.filter_by(mine_guid=_id).filter_by(active_ind=True).first()

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import Base, AuditMixin, SoftDeleteMixin, HistoryMixin
from app.extensions import db

class MineReportReqPermitConditionXref(Base, AuditMixin, SoftDeleteMixin, HistoryMixin):
    __tablename__ = "mine_report_req_permit_condition_xref"
    __versioned__ = {}

    mine_report_req_permit_condition_xref_guid = db.Column(UUID(as_uuid=True),
                                                       primary_key=True,
                                                       server_default=FetchedValue())
    mine_report_permit_requirement_id = db.Column(
        db.Integer, db.ForeignKey('mine_report_permit_requirement.mine_report_permit_requirement_id'))
    permit_condition_id = db.Column(
        db.Integer, db.ForeignKey('permit_conditions.permit_condition_id'))
    mine_report_permit_requirement = db.relationship(
        'MineReportPermitRequirement',
        lazy='joined',
        primaryjoin='MineReportReqPermitConditionXref.mine_report_permit_requirement_id == MineReportPermitRequirement.mine_report_permit_requirement_id',
    )

    def __repr__(self):
        return '<MineReportReqPermitConditionXref %r>', self.mine_report_req_permit_condition_xref_guid
    
    @classmethod
    def create(cls,
               mine_report_permit_requirement,
               permit_condition_id):
        mine_report_req_permit_condition_xref = cls(
            mine_report_permit_requirement=mine_report_permit_requirement,
            permit_condition_id=permit_condition_id,    
        )
        return mine_report_req_permit_condition_xref
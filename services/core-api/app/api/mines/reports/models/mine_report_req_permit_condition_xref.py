from sqlalchemy.dialects.postgresql import UUID
import uuid
from typing import Self

from app.api.utils.models_mixins import Base, AuditMixin, SoftDeleteMixin, HistoryMixin
from app.extensions import db

class MineReportReqPermitConditionXref(SoftDeleteMixin, AuditMixin, HistoryMixin, Base):
    __tablename__ = "mine_report_req_permit_condition_xref"
    __versioned__ = {}

    mine_report_req_permit_condition_xref_guid = db.Column(UUID(as_uuid=True),
                                                       primary_key=True,
                                                       default=uuid.uuid4,
                                                       nullable=False)
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
        return f'<MineReportReqPermitConditionXref {self.mine_report_req_permit_condition_xref_guid}>'
    
    @classmethod
    def find_by_permit_condition_id(cls, id) -> Self:
        return cls.query.filter_by(permit_condition_id=id, deleted_ind=False).one_or_none()
    
    @classmethod
    def create(cls,
               mine_report_permit_requirement,
               permit_condition_id):
        mine_report_req_permit_condition_xref = cls(
            mine_report_permit_requirement=mine_report_permit_requirement,
            permit_condition_id=permit_condition_id,    
        )
        return mine_report_req_permit_condition_xref
    
    @classmethod
    def delete_all_by_permit_amendment_id(cls, permit_amendment_id, commit=False):
        xrefs = (
            cls.query.join(cls.mine_report_permit_requirement).filter_by(
                permit_amendment_id=permit_amendment_id,
                deleted_ind=False,
            )
            .all()
        )
        for xref in xrefs:
            xref.delete(commit=commit)

        db.session.commit()
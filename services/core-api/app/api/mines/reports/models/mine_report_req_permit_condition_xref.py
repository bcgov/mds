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
        db.Integer, db.ForeignKey('permit_conditions.permit_condition_id'), nullable=True)

    # Use polymorphic_on to distinguish between standard and non-standard xrefs
    is_standard = db.Column(db.Boolean, nullable=False, server_default='false')
    __mapper_args__ = {
        "polymorphic_on": is_standard,
        "polymorphic_identity": False,
    }

    mine_report_permit_requirement = db.relationship(
        'MineReportPermitRequirement',
        lazy='joined',
        primaryjoin='and_(MineReportReqPermitConditionXref.mine_report_permit_requirement_id == MineReportPermitRequirement.mine_report_permit_requirement_id, MineReportPermitRequirement.deleted_ind==False)',
    )

    def __repr__(self):
        return f'<MineReportReqPermitConditionXref {self.mine_report_req_permit_condition_xref_guid}>'
    
    @classmethod
    def find_by_permit_condition_id(cls, id) -> Self | None:
        if id is None:
            return None
        xref = cls.query.filter_by(permit_condition_id=id, deleted_ind=False).one_or_none()
        if xref is None or xref.mine_report_permit_requirement is None:
            return None
        return xref
    
    @classmethod
    def find_by_many_permit_condition_ids(cls, ids) -> Self:
        return cls.query.filter(cls.permit_condition_id.in_(ids), cls.deleted_ind==False).all()
    
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

# Subclass for standard report xrefs (is_standard=True, standard_permit_condition_id)
class StandardReportReqPermitConditionXref(MineReportReqPermitConditionXref):
    __mapper_args__ = {
        "polymorphic_identity": True,
    }

    standard_permit_condition_id = db.Column(
        db.Integer, db.ForeignKey('standard_permit_conditions.standard_permit_condition_id'), nullable=True)
    
    mine_report_permit_requirement = db.relationship(
        'StandardReportPermitRequirement',
        lazy='joined',
        primaryjoin='and_(StandardReportReqPermitConditionXref.mine_report_permit_requirement_id == StandardReportPermitRequirement.mine_report_permit_requirement_id, StandardReportPermitRequirement.deleted_ind==False)',
    )

    @property
    def permit_condition_id(self):
        return self.standard_permit_condition_id

    @permit_condition_id.setter
    def permit_condition_id(self, value):
        self.standard_permit_condition_id = value

    def __repr__(self):
        return f'<StandardReportReqPermitConditionXref {self.mine_report_req_permit_condition_xref_guid}>'

    @classmethod
    def find_by_many_permit_condition_ids(cls, ids) -> Self:
        return cls.query.filter(cls.standard_permit_condition_id.in_(ids), cls.deleted_ind==False).all()
    
    @classmethod
    def find_by_permit_condition_id(cls, id) -> Self | None:
        if id is None:
            return None
        xref = cls.query.filter_by(standard_permit_condition_id=id, deleted_ind=False).one_or_none()
        if xref is None or xref.mine_report_permit_requirement is None:
            return None
        return xref
    
    @classmethod
    def create(cls,
               mine_report_permit_requirement,
               permit_condition_id):
        standard_report_req_permit_condition_xref = cls(
            mine_report_permit_requirement=mine_report_permit_requirement,
            standard_permit_condition_id=permit_condition_id,    
        )
        return standard_report_req_permit_condition_xref
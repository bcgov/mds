from datetime import date
from enum import Enum
from typing import Optional, Self

from app.api.utils.models_mixins import AuditMixin, Base, SoftDeleteMixin, HistoryMixin
from app.extensions import db
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import backref
from app.api.mines.reports.models.mine_report_req_permit_condition_xref import MineReportReqPermitConditionXref, StandardReportReqPermitConditionXref

class CimOrCpo(str, Enum):
    CIM = "CIM"
    CPO = "CPO"
    Both = "Both"

    def __str__(self):
        return self.value


class OfficeDestination(str, Enum):
    MMO = "MMO"
    HS = "HS"
    RO = "RO"
    MOE = "MOE"

    def __str__(self):
        return self.value


class MineReportPermitRequirement(SoftDeleteMixin, AuditMixin, HistoryMixin, Base):
    __tablename__ = "mine_report_permit_requirement"

    mine_report_permit_requirement_id: int = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    due_date_period_months: int = db.Column(db.Integer, nullable=False)
    initial_due_date: Optional[date] = db.Column(db.Date, nullable=True)
    report_name = db.Column(db.String(512), nullable=True)
   
    active_ind: bool = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    cim_or_cpo: Optional[CimOrCpo] = db.Column(db.Enum(CimOrCpo, name='cim_or_cpo_type'), nullable=True)
    ministry_recipient: Optional[list[OfficeDestination]] = db.Column(
        ARRAY(db.Enum(OfficeDestination, name='ministry_recipient_type')), nullable=True)
    permit_amendment_id: int = db.Column(db.Integer, db.ForeignKey('permit_amendment.permit_amendment_id'))
    is_standard: bool = db.Column(db.Boolean, nullable=False, server_default='false')

    # creates a filter for the class so that all results returned by the cls.query have is_standard=False
    __mapper_args__ = {
        "polymorphic_on": is_standard,
        "polymorphic_identity": False,
    }

    mine_report_req_permit_conditions: list[MineReportReqPermitConditionXref] = db.relationship(
        MineReportReqPermitConditionXref,
        overlaps="mine_report_permit_requirement",
        lazy='joined',
        primaryjoin='and_(MineReportPermitRequirement.mine_report_permit_requirement_id == MineReportReqPermitConditionXref.mine_report_permit_requirement_id, MineReportReqPermitConditionXref.deleted_ind==False)',
    )
    permit_conditions = db.relationship(
        'PermitConditions',
        secondary='mine_report_req_permit_condition_xref',
        secondaryjoin='and_(MineReportReqPermitConditionXref.permit_condition_id == PermitConditions.permit_condition_id, MineReportReqPermitConditionXref.deleted_ind==False)',
        lazy='joined',
        backref=backref('mine_report_permit_requirements', lazy='joined')
    )
    
    @hybrid_property
    def permit_condition_ids(self) -> list[int]:
        if isinstance(self.mine_report_req_permit_conditions, list):
            return [xref.permit_condition_id for xref in self.mine_report_req_permit_conditions or []]
        return []

    def __repr__(self):
        return '<MineReportPermitRequirement %r>' % self.mine_report_permit_requirement_id

    @classmethod
    def find_by_mine_report_permit_requirement_id(cls, id) -> "MineReportPermitRequirement":
        try:
            return cls.query.filter_by(mine_report_permit_requirement_id=id, deleted_ind=False).first()
        except ValueError:
            return None
        
    @classmethod
    def find_by_permit_condition_id(cls, id) -> Self | None:
        xref = MineReportReqPermitConditionXref.find_by_permit_condition_id(id)
        if xref:
            return xref.mine_report_permit_requirement
        return None

    @classmethod
    def find_by_report_name(cls, report_name) -> "MineReportPermitRequirement":
        try:
            return cls.query.filter_by(report_name=report_name).all()
        except ValueError:
            return None

    @classmethod
    def get_all(cls) -> list["MineReportPermitRequirement"]:
        try:
            return cls.query.all()
        except ValueError:
            return None
        

    def update_permit_conditions(self, new_permit_condition_ids) -> "MineReportPermitRequirement":
        current_condition_ids = self.permit_condition_ids
        
        to_add = [c for c in new_permit_condition_ids if c not in current_condition_ids]
        to_delete = [x for x in self.mine_report_req_permit_conditions if x.permit_condition_id not in new_permit_condition_ids]
        
        for xref in to_delete:
            xref.delete()

        for permit_condition_id in to_add:
            xref = MineReportReqPermitConditionXref.create(
                mine_report_permit_requirement=self,
                permit_condition_id=permit_condition_id
            )

            self.mine_report_req_permit_conditions.append(xref)
    
    def update(self, **kwargs):
        for key, value in kwargs.items():
            if key in ['mine_report_permit_requirement_id', 'permit_amendment_id', 'permit_condition_ids', 'is_standard']:
                continue     # non-editable fields from put or should be handled separately
            setattr(self, key, value)
        
        new_permit_condition_ids = kwargs.get('permit_condition_ids')
        self.update_permit_conditions(new_permit_condition_ids)
        self.save()
    

    @classmethod
    def create(cls,
               report_name: Optional[str],
               due_date_period_months: int,
               initial_due_date: Optional[date],
               cim_or_cpo: Optional[CimOrCpo],
               ministry_recipient: Optional[list[OfficeDestination]],
               permit_condition_ids: list[int],
               permit_amendment_id: int) -> "MineReportPermitRequirement":

        mine_report_permit_requirement = cls(
            report_name=report_name,
            due_date_period_months=due_date_period_months,
            initial_due_date=initial_due_date,
            cim_or_cpo=cim_or_cpo,
            ministry_recipient=ministry_recipient,
            permit_amendment_id=permit_amendment_id
        )
        for permit_condition_id in permit_condition_ids:
            xref = MineReportReqPermitConditionXref.create(
                mine_report_permit_requirement=mine_report_permit_requirement,
                permit_condition_id=permit_condition_id
            )

            mine_report_permit_requirement.mine_report_req_permit_conditions.append(xref)

        mine_report_permit_requirement.save(commit=True)
        return mine_report_permit_requirement


class StandardReportPermitRequirement(MineReportPermitRequirement):
    # creates the opposite filter for the class so cls.query all results have is_standard=true
    __mapper_args__ = {
        "polymorphic_identity": True,
    }

    mine_report_req_permit_conditions: list[StandardReportReqPermitConditionXref] = db.relationship(
        StandardReportReqPermitConditionXref,
        overlaps="mine_report_permit_requirement",
        lazy='joined',
        primaryjoin='and_(StandardReportPermitRequirement.mine_report_permit_requirement_id == StandardReportReqPermitConditionXref.mine_report_permit_requirement_id, StandardReportReqPermitConditionXref.deleted_ind==False)',
    )
    permit_conditions = db.relationship(
        'StandardPermitConditions',
        secondary='mine_report_req_permit_condition_xref',
        secondaryjoin='and_(StandardReportReqPermitConditionXref.standard_permit_condition_id == StandardPermitConditions.standard_permit_condition_id, StandardReportReqPermitConditionXref.deleted_ind==False)',
        lazy='joined',
        backref=backref('mine_report_permit_requirements', lazy='joined')
    )

    def update_permit_conditions(self, new_permit_condition_ids) -> "StandardReportPermitRequirement":
        current_condition_ids = self.permit_condition_ids
        
        to_add = [c for c in new_permit_condition_ids if c not in current_condition_ids]
        to_delete = [x for x in self.mine_report_req_permit_conditions if x.permit_condition_id not in new_permit_condition_ids]
        
        for xref in to_delete:
            xref.delete()

        for permit_condition_id in to_add:
            xref = StandardReportReqPermitConditionXref.create(
                mine_report_permit_requirement=self,
                permit_condition_id=permit_condition_id
            )

            self.mine_report_req_permit_conditions.append(xref)

    @classmethod
    def create(cls,
               report_name: Optional[str],
               due_date_period_months: int,
               cim_or_cpo: Optional[CimOrCpo],
               ministry_recipient: Optional[list[OfficeDestination]],
               permit_condition_ids: list[int]
               ) -> "StandardReportPermitRequirement":

        standard_report_permit_requirement = cls(
            report_name=report_name,
            due_date_period_months=due_date_period_months,\
            cim_or_cpo=cim_or_cpo,
            ministry_recipient=ministry_recipient,
        )
        for permit_condition_id in permit_condition_ids:
            xref = StandardReportReqPermitConditionXref.create(
                mine_report_permit_requirement=standard_report_permit_requirement,
                permit_condition_id=permit_condition_id
            )

            standard_report_permit_requirement.mine_report_req_permit_conditions.append(xref)

        standard_report_permit_requirement.save(commit=True)
        return standard_report_permit_requirement
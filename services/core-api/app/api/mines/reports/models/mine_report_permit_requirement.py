from datetime import date
from enum import Enum
from typing import Optional

from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import Base, AuditMixin, SoftDeleteMixin
from app.extensions import db


class CimOrCpo(str, Enum):
    CIM = "CIM"
    CPO = "CPO"
    BOTH = "BOTH"

    def __str__(self):
        return self.value


class OfficeDestination(str, Enum):
    MMO = "MMO"
    HS = "HS"
    RO = "RO"
    MOE = "MOE"

    def __str__(self):
        return self.value


class MineReportPermitRequirement(SoftDeleteMixin, Base, AuditMixin):
    __tablename__ = "mine_report_permit_requirement"

    mine_report_permit_requirement_id: int = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    due_date_period_months: int = db.Column(db.Integer, nullable=False)
    initial_due_date: Optional[date] = db.Column(db.Date, nullable=True)
    active_ind: bool = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    cim_or_cpo: Optional[CimOrCpo] = db.Column(db.Enum(CimOrCpo, name='cim_or_cpo_type'), nullable=True)
    ministry_recipient: Optional[list[OfficeDestination]] = db.Column(
        ARRAY(db.Enum(OfficeDestination, name='ministry_recipient_type')), nullable=True)
    permit_condition_id: int = db.Column(db.Integer, db.ForeignKey('permit_conditions.permit_condition_id'))
    permit_amendment_id: int = db.Column(db.Integer, db.ForeignKey('permit_amendment.permit_amendment_id'))

    def __repr__(self):
        return '<MineReportPermitRequirement %r>' % self.permit_report_requirement_id

    @classmethod
    def find_by_permit_report_requirement_id(cls, _id) -> "MineReportPermitRequirement":
        try:
            return cls.query.filter_by(permit_report_requirement_id=_id).first()
        except ValueError:
            return None

    @classmethod
    def find_by_report_name(cls, _report_name) -> "MineReportPermitRequirement":
        try:
            return cls.query.filter_by(report_name=_report_name).all()
        except ValueError:
            return None

    @classmethod
    def get_all(cls) -> list["MineReportPermitRequirement"]:
        try:
            return cls.query.all()
        except ValueError:
            return None

    @classmethod
    def create(cls,
               due_date_period_months: int,
               initial_due_date: date,
               cim_or_cpo: Optional[CimOrCpo],
               ministry_recipient: Optional[list[OfficeDestination]],
               permit_condition_id: int,
               permit_amendment_id: int) -> "MineReportPermitRequirement":

        mine_report_permit_requirement = cls(
            due_date_period_months=due_date_period_months,
            initial_due_date=initial_due_date,
            cim_or_cpo=cim_or_cpo,
            ministry_recipient=ministry_recipient,
            permit_condition_id=permit_condition_id,
            permit_amendment_id=permit_amendment_id
        )

        mine_report_permit_requirement.save(commit=True)
        return mine_report_permit_requirement

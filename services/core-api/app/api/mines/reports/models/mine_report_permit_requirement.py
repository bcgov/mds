from datetime import datetime
from enum import Enum

from sqlalchemy.dialects.postgresql import UUID, ENUM, ARRAY
from sqlalchemy.schema import FetchedValue
from app.api.utils.models_mixins import Base, AuditMixin
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

class MineReportPermitRequirement(Base, AuditMixin):
    __tablename__ = "mine_report_permit_requirement"

    mine_report_permit_requirement_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    update_user = db.Column(db.String(255), nullable=False)
    update_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    due_date_period_months = db.Column(db.Integer, nullable=False)
    create_user = db.Column(db.String(255), nullable=False)
    create_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    cim_or_cpo = db.Column(db.Enum(CimOrCpo), nullable=True)
    office_destination = db.Column(ARRAY(db.Enum(OfficeDestination)), nullable=True)
    permit_condition_id = db.Column(db.Integer, db.ForeignKey('permit_conditions.permit_condition_id'))
    permit_id = db.Column(db.Integer, db.ForeignKey('permit.permit_id'))

    def __repr__(self):
        return '<MineReportPermitRequirement %r>' % self.permit_report_requirement_id

    @classmethod
    def find_by_permit_report_requirement_id(cls, _id):
        try:
            return cls.query.filter_by(permit_report_requirement_id=_id).first()
        except ValueError:
            return None

    @classmethod
    def find_by_report_name(cls, _report_name):
        try:
            return cls.query.filter_by(report_name=_report_name).all()
        except ValueError:
            return None

    @classmethod
    def get_all(cls):
        try:
            return cls.query.all()
        except ValueError:
            return None
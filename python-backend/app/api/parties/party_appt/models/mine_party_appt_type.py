from datetime import datetime
import re
import uuid

from sqlalchemy import func, desc
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from ...party.models.party import Party
from ....utils.models_mixins import AuditMixin, Base


class MinePartyAppointmentType(AuditMixin, Base):
    __tablename__ = "mine_party_appt_type_code"
    mine_party_appt_type_code = db.Column(db.String(3), primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    person = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    organization = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    grouping_level = db.Column(db.Integer)

    def json(self):
        return {
            'mine_party_appt_type_code': self.mine_party_appt_type_code,
            'description': self.description,
            'display_order': self.display_order,
            'person': self.person,
            'organization': self.organization,
            'grouping_level': self.grouping_level,
            'active_ind': self.active_ind
        }

    @classmethod
    def find_by_mine_party_appt_type_code(cls, code):
        try:
            return cls.query.filter_by(mine_party_appt_type_code=code).first()
        except ValueError:
            return None

    @classmethod
    def find_all_active(cls):
        try:
            return cls.query.filter_by(active_ind=True).order_by(
                desc(cls.grouping_level), cls.display_order).all()
        except ValueError:
            return None

import uuid
import datetime

from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base


class MineIncidentCategory(AuditMixin, Base):
    __tablename__ = 'mine_incident_category'
    mine_incident_category_code = db.Column(db.String(3), primary_key=True)
    description = db.Column(db.String, nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    is_historic = db.Column(db.Boolean)
    parent_mine_incident_category_code = db.Column(db.String, db.ForeignKey('mine_incident_category.mine_incident_category_code'))

    @classmethod
    def get_all(cls):
        # TODO - Remove is_historic filter when frontend Incident Category Code dropdowns are updated
        return cls.query.order_by(cls.display_order).filter_by(is_historic=True)

    @classmethod
    def find_by_code(cls, code):
        return cls.query.get(code)

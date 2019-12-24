from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db


class ActivityEquipmentXref(Base):
    __tablename__ = "activity_equipment_xref"

    activity_summary_id = db.Column(
        db.Integer, db.ForeignKey('activity_summary.activity_summary_id'), primary_key=True)
    equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.equipment_id'), primary_key=True)

    def __repr__(self):
        return f'<ActivityEquipmentXref activity_summary_id={self.activity_summary_id}, equipment_id={self.equipment_id}>'

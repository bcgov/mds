import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class ETLEquipment(Base):
    __tablename__ = 'etl_equipment'
    equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.equipment_id'), primary_key=True)
    equipmentid = db.Column(db.Integer)

    equipment = db.relationship('Equipment', uselist=False, load_on_pending=True, back_populates='_etl_equipment')

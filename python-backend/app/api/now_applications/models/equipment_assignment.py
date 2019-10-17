from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db


class EquipmentAssignment(AuditMixin, Base):
    __tablename__ = "equipment_assignment"

    equipment_assignment_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    now_application_id = db.Column(db.Integer, db.ForeignKey('now_application.now_application_id'))
    equipment_assignment_type_code = db.Column(
        db.String, db.ForeignKey('equipment_assignment_type.equipment_assignment_type_code'))
    equipment_id = db.Column(db.Integer, db.ForeignKey('equipment.equipment_id'))

    def __repr__(self):
        return '<EquipmentAssignment %r>' % self.equipment_assignment_id

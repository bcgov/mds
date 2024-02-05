from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from flask import current_app

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db
from app.api.constants import *


class Equipment(AuditMixin, Base):
    __tablename__ = "equipment"
    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]

    equipment_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    description = db.Column(db.String)
    quantity = db.Column(db.Integer)
    capacity = db.Column(db.String)
    _etl_equipment = db.relationship('ETLEquipment', load_on_pending=True, back_populates='equipment')
    activity_equipment_xref = db.relationship('ActivityEquipmentXref', load_on_pending=True, overlaps='equipment')

    def __repr__(self):
        return '<Equipment %r>' % self.equipment_id

    def delete(self, commit=True):
        for item in self.activity_equipment_xref:
            item.delete(commit)
        for item in self._etl_equipment:
            item.delete(commit)
        super(Equipment, self).delete(commit)

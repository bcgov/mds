from ....utils.models_mixins import Base
from app.extensions import db


class NOWPlacerEquipXref(Base):
    __tablename__ = "placer_equip_xref"
    __table_args__ = { "schema": "now_submissions" }
    messageid = db.Column(db.Integer, db.ForeignKey('application.messageid'))
    equipmentid = db.Column(db.Integer, db.ForeignKey('equipment.equipmentid'))


    def __repr__(self):
        return '<NOWPlacerEquipXref %r>' % self.messageid

from app.api.utils.models_mixins import Base
from app.extensions import db


class MechTrenchingEquipXref(Base):
    __tablename__ = "mech_trenching_equip_xref"
    __table_args__ = { "schema": "now_submissions" }
    messageid = db.Column(db.Integer, db.ForeignKey('now_submissions.application.messageid'))
    equipmentid = db.Column(db.Integer, db.ForeignKey('now_submissions.equipment.equipmentid'))


    def __repr__(self):
        return '<MechTrenchingEquipXref %r>' % self.messageid

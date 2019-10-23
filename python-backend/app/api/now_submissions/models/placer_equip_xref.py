from app.api.utils.models_mixins import Base
from app.extensions import db


class PlacerEquipXref(Base):
    __tablename__ = "placer_equip_xref"
    __table_args__ = {"schema": "now_submissions"}
    messageid = db.Column(db.Integer,
                          db.ForeignKey('now_submissions.application.messageid'),
                          primary_key=True)
    equipmentid = db.Column(db.Integer,
                            db.ForeignKey('now_submissions.equipment.equipmentid'),
                            primary_key=True)

    def __repr__(self):
        return '<PlacerEquipXref %r>' % self.messageid

from ....utils.models_mixins import Base
from app.extensions import db


class NOWSurfaceBulkSampleEquipXref(Base):
    __tablename__ = "surface_bulk_sample_equip_xref"
    __table_args__ = { "schema": "now_submissions" }
    messageid = db.Column(db.Integer)
    equipmentid = db.Column(db.Integer)

    # FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
    # FOREIGN KEY (EQUIPMENTID) REFERENCES NOW_Submissions.equipment(EQUIPMENTID) DEFERRABLE INITIALLY DEFERRED

    def __repr__(self):
        return '<NOWSurfaceBulkSampleEquipXref %r>' % self.messageid

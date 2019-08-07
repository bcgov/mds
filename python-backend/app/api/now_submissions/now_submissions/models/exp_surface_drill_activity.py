from ....utils.models_mixins import Base
from app.extensions import db


class NOWExpSurfaceDrillActivity(Base):
    __tablename__ = "exp_surface_drill_activity"
    __table_args__ = { "schema": "now_submissions" }
    id = db.Column(db.Integer, primary_key=True)
    messageid = db.Column(db.Integer)
    type = db.Column(db.String)
    numberofsites = db.Column(db.Integer)
    disturbedarea = db.Column(db.Numeric(14,2))
    timbervolume = db.Column(db.Numeric(14,2))

    # FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED

    def __repr__(self):
        return '<NOWExpSurfaceDrillActivity %r>' % self.id

from app.api.utils.models_mixins import Base
from app.extensions import db


class MMSWaterSourceActivity(Base):
    __tablename__ = "water_source_activity"
    __table_args__ = {"schema": "mms_now_submissions"}
    id = db.Column(db.Integer, primary_key=True)
    messageid = db.Column(db.Integer, db.ForeignKey('mms_now_submissions.application.messageid'))
    mms_cid = db.Column(db.Integer)
    type = db.Column(db.String)
    useofwater = db.Column(db.String)
    estimateratewater = db.Column(db.Numeric(14, 2))
    pumpsizeinwater = db.Column(db.Numeric(14, 2))
    locationwaterintake = db.Column(db.String)
    sourcewatersupply = db.Column(db.String)

    def __repr__(self):
        return '<MMSWaterSourceActivity %r>' % self.id

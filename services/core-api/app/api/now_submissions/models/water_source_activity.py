from sqlalchemy.schema import FetchedValue
from app.api.utils.models_mixins import Base
from app.extensions import db


class WaterSourceActivity(Base):
    __tablename__ = "water_source_activity"
    __table_args__ = {"schema": "now_submissions"}
    id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    messageid = db.Column(db.Integer, db.ForeignKey('now_submissions.application.messageid'))
    sourcewatersupply = db.Column(db.String)
    type = db.Column(db.String)
    useofwater = db.Column(db.String)
    estimateratewater = db.Column(db.Numeric(14, 2))
    pumpsizeinwater = db.Column(db.Numeric(14, 2))
    locationwaterintake = db.Column(db.String)
    seq_no = db.Column(db.Integer)

    def __repr__(self):
        return '<WaterSourceActivity %r>' % self.id

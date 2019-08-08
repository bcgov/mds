from ....utils.models_mixins import Base
from app.extensions import db


class WaterSourceActivity(Base):
    __tablename__ = "document_start_stop"
    __table_args__ = { "schema": "now_submissions" }
    id = db.Column(db.Integer, primary_key=True)
    messageid = db.Column(db.Integer, db.ForeignKey('application.messageid'))
    sourcewatersupply = db.Column(db.String)
    type = db.Column(db.String)
    useofwater = db.Column(db.String)
    estimateratewater = db.Column(db.Numeric(14,2))
    pumpsizeinwater = db.Column(db.Numeric(14,2))
    locationwaterintake = db.Column(db.String)
    seq_no integer


    def __repr__(self):
        return '<WaterSourceActivity %r>' % self.id

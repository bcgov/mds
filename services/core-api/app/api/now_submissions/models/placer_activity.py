from app.api.utils.models_mixins import Base
from app.extensions import db


class PlacerActivity(Base):
    __tablename__ = "placer_activity"
    __table_args__ = {"schema": "now_submissions"}
    placeractivityid = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String)
    quantity = db.Column(db.Integer)
    depth = db.Column(db.Integer)
    length = db.Column(db.Integer)
    width = db.Column(db.Integer)
    disturbedarea = db.Column(db.Numeric(14, 2))
    timbervolume = db.Column(db.Numeric(14, 2))

    def __repr__(self):
        return '<PlacerActivity %r>' % self.placeractivityid

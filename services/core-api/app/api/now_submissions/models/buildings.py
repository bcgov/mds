from sqlalchemy.schema import FetchedValue
from app.api.utils.models_mixins import Base
from app.extensions import db


class Buildings(Base):
    __tablename__ = "buildings"
    __table_args__ = {"schema": "now_submissions"}
    id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    messageid = db.Column(db.Integer, db.ForeignKey('now_submissions.application.messageid'))
    name = db.Column(db.String)
    purpose = db.Column(db.String)
    structure = db.Column(db.String)
    disturbedarea = db.Column(db.Numeric)
    timbervolume = db.Column(db.Numeric)

    def __repr__(self):
        return '<Buildings %r>' % self.id
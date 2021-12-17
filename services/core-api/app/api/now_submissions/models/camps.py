from sqlalchemy.schema import FetchedValue
from app.api.utils.models_mixins import Base
from app.extensions import db


class Camps(Base):
    __tablename__ = "camps"
    __table_args__ = {"schema": "now_submissions"}
    id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    messageid = db.Column(db.Integer, db.ForeignKey('now_submissions.application.messageid'))
    name = db.Column(db.String)
    peopleincamp = db.Column(db.Numeric)
    numberofstructures = db.Column(db.Numeric)
    descriptionofstructures = db.Column(db.String)
    wastedisposal = db.Column(db.String)
    sanitaryfacilities = db.Column(db.String)
    watersupply = db.Column(db.String)
    quantityofwater = db.Column(db.Numeric)
    disturbedarea = db.Column(db.Numeric)
    timbervolume = db.Column(db.Numeric)
    width = db.Column(db.Numeric)
    length = db.Column(db.Numeric)

    def __repr__(self):
        return '<Camps %r>' % self.id
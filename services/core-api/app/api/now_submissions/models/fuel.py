from sqlalchemy.schema import FetchedValue
from app.api.utils.models_mixins import Base
from app.extensions import db


class Fuel(Base):
    __tablename__ = "fuel"
    __table_args__ = {"schema": "now_submissions"}
    id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    messageid = db.Column(db.Integer, db.ForeignKey('now_submissions.application.messageid'))
    fueltype = db.Column(db.String)
    fuelrelatedactivity = db.Column(db.String)
    estimatedfuelvolume = db.Column(db.Numeric(14, 2))
    descriptionoffuelrelatedactivity = db.Column(db.String)
    descriptionofprecautionarymeasures = db.Column(db.String)

    def __repr__(self):
        return '<Fuel %r>' % self.id

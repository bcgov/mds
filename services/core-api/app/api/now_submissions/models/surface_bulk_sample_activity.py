from sqlalchemy.schema import FetchedValue
from app.api.utils.models_mixins import Base
from app.extensions import db


class SurfaceBulkSampleActivity(Base):
    __tablename__ = "surface_bulk_sample_activity"
    __table_args__ = {"schema": "now_submissions"}
    id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    messageid = db.Column(db.Integer, db.ForeignKey('now_submissions.application.messageid'))
    type = db.Column(db.String)
    disturbedarea = db.Column(db.Numeric(14, 2))
    timbervolume = db.Column(db.Numeric(14, 2))
    quantity = db.Column(db.Integer)
    width = db.Column(db.Numeric)
    length = db.Column(db.Numeric)

    def __repr__(self):
        return '<SurfaceBulkSampleActivity %r>' % self.id

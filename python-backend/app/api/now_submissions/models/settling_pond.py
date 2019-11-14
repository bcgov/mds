from app.api.utils.models_mixins import Base
from app.extensions import db


class SettlingPondSubmission(Base):
    __tablename__ = "settling_pond"
    __table_args__ = {"schema": "now_submissions"}
    settlingpondid = db.Column(db.Integer, primary_key=True)
    pondid = db.Column(db.String)
    watersource = db.Column(db.String)
    width = db.Column(db.Integer)
    length = db.Column(db.Integer)
    depth = db.Column(db.Integer)
    constructionmethod = db.Column(db.String)
    disturbedarea = db.Column(db.Numeric(14, 2))
    timbervolume = db.Column(db.Numeric(14, 2))

    def __repr__(self):
        return '<SettlingPondSubmission %r>' % self.settlingpondid

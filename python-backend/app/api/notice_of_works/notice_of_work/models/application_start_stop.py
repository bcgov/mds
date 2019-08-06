from ....utils.models_mixins import Base
from app.extensions import db


class NOWApplicationStartStop(Base):
    __tablename__ = "application_start_stop"
    __table_args__ = { "schema": "now_submissions" }
    messageid = db.Column(db.Integer, primary_key=True)
    nrsosapplicationid = db.Column(db.String)
    submitteddate = db.Column(db.DateTime)
    receiveddate = db.Column(db.DateTime)
    nownumber = db.Column(db.String)
    startworkdate = db.Column(db.DateTime)
    endworkdate = db.Column(db.DateTime)
    processed = db.Column(db.String)
    processeddate = db.Column(db.DateTime)

    def __repr__(self):
        return '<NOWApplicationStartStop %r>' % self.messageid

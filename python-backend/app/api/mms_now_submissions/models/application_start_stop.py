from app.api.utils.models_mixins import Base
from app.extensions import db


class MMSApplicationStartStop(Base):
    __tablename__ = "application_start_stop"
    __table_args__ = {"schema": "mms_now_submissions"}
    id = db.Column(db.Integer, primary_key=True)
    messageid = db.Column(db.Integer, db.ForeignKey('mms_now_submissions.application.messageid'))
    mms_cid = db.Column(db.Integer)
    startworkdate = db.Column(db.DateTime)
    endworkdate = db.Column(db.DateTime)

    def __repr__(self):
        return '<MMSApplicationStartStop %r>' % self.id

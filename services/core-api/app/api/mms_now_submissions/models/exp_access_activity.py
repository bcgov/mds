from app.api.utils.models_mixins import Base
from app.extensions import db


class MMSExpAccessActivity(Base):
    __tablename__ = "exp_access_activity"
    __table_args__ = {"schema": "mms_now_submissions"}
    id = db.Column(db.Integer, primary_key=True)
    messageid = db.Column(db.Integer, db.ForeignKey('mms_now_submissions.application.messageid'))
    mms_cid = db.Column(db.Integer)
    type = db.Column(db.String)
    length = db.Column(db.Numeric(14, 2))
    disturbedarea = db.Column(db.Numeric(14, 2))
    timbervolume = db.Column(db.Numeric(14, 2))

    def __repr__(self):
        return '<MMSExpAccessActivity %r>' % self.id

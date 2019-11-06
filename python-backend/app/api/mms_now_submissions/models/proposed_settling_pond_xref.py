from app.api.utils.models_mixins import Base
from app.extensions import db


class MMSProposedSettlingPondXref(Base):
    __tablename__ = "proposed_settling_pond_xref"
    __table_args__ = {"schema": "mms_now_submissions"}
    mms_cid = db.Column(
        db.Integer, db.ForeignKey('mms_now_submissions.application.mms_cid'), primary_key=True)
    settlingpondid = db.Column(
        db.Integer,
        db.ForeignKey('mms_now_submissions.settling_pond.settlingpondid'),
        primary_key=True)

    def __repr__(self):
        return '<MMSProposedSettlingPondXref>'

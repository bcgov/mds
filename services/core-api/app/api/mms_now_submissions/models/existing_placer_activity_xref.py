from app.api.utils.models_mixins import Base
from app.extensions import db


class MMSExistingPlacerActivityXref(Base):
    __tablename__ = "existing_placer_activity_xref"
    __table_args__ = {"schema": "mms_now_submissions"}
    mms_cid = db.Column(
        db.Integer, db.ForeignKey('mms_now_submissions.application.mms_cid'), primary_key=True)
    placeractivityid = db.Column(
        db.Integer,
        db.ForeignKey('mms_now_submissions.placer_activity.placeractivityid'),
        primary_key=True)

    def __repr__(self):
        return '<MMSExistingPlacerActivityXref>'

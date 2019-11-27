from app.api.utils.models_mixins import Base
from app.extensions import db


class ExistingPlacerActivityXref(Base):
    __tablename__ = "existing_placer_activity_xref"
    __table_args__ = { "schema": "now_submissions" }
    messageid = db.Column(db.Integer, db.ForeignKey('now_submissions.application.messageid'), primary_key=True)
    placeractivityid = db.Column(db.Integer, db.ForeignKey('now_submissions.placer_activity.placeractivityid'), primary_key=True)


    def __repr__(self):
        return '<ExistingPlacerActivityXref %r>' % self.messageid

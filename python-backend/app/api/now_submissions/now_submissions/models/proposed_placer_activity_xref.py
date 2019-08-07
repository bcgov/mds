from ....utils.models_mixins import Base
from app.extensions import db


class NOWProposedPlacerActivityXref(Base):
    __tablename__ = "proposed_placer_activity_xref"
    __table_args__ = { "schema": "now_submissions" }
    messageid = db.Column(db.Integer)
    placeractivityid = db.Column(db.Integer)

    # FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
    # FOREIGN KEY (PLACERACTIVITYID) REFERENCES NOW_Submissions.placer_activity(PLACERACTIVITYID) DEFERRABLE INITIALLY

    def __repr__(self):
        return '<NOWProposedPlacerActivityXref %r>' % self.messageid

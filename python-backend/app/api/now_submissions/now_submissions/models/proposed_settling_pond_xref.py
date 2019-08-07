from ....utils.models_mixins import Base
from app.extensions import db


class NOWProposedSettlingPondXref(Base):
    __tablename__ = "proposed_settling_pond_xref"
    __table_args__ = { "schema": "now_submissions" }
    messageid = db.Column(db.Integer)
    settlingpondid = db.Column(db.Integer)

    # FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED
    # FOREIGN KEY (SETTLINGPONDID) REFERENCES NOW_Submissions.settling_pond(SETTLINGPONDID) DEFERRABLE INITIALLY DEFERRED

    def __repr__(self):
        return '<NOWProposedSettlingPondXref %r>' % self.messageid

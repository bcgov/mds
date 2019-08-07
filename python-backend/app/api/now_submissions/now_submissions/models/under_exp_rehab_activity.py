from ....utils.models_mixins import Base
from app.extensions import db


class NOWUnderExpRehabActivity(Base):
    __tablename__ = "under_exp_rehab_activity"
    __table_args__ = { "schema": "now_submissions" }
    id = db.Column(db.Integer, primary_key=True)
    messageid = db.Column(db.Integer)
    type = db.Column(db.String)
    incline = db.Column(db.Numeric(14,1))
    inclineunits = db.Column(db.String)
    quantity = db.Column(db.Integer)
    length = db.Column(db.Numeric(14,1))
    width = db.Column(db.Numeric(14,1))
    height = db.Column(db.Numeric(14,1))
    seq_no = db.Column(db.Integer)

    # FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED

    def __repr__(self):
        return '<NOWUnderExpRehabActivity %r>' % self.id

from ....utils.models_mixins import Base
from app.extensions import db


class NOWProposedSettlingPondXref(Base):
    __tablename__ = "proposed_settling_pond_xref"
    __table_args__ = { "schema": "now_submissions" }
    messageid = db.Column(db.Integer, db.ForeignKey('application.messageid'))
    settlingpondid = db.Column(db.Integer, db.ForeignKey('settling_pond.settlingpondid'))


    def __repr__(self):
        return '<NOWProposedSettlingPondXref %r>' % self.messageid

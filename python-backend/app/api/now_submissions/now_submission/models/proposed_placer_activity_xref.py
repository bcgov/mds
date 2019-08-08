from ....utils.models_mixins import Base
from app.extensions import db


class ProposedPlacerActivityXref(Base):
    __tablename__ = "proposed_placer_activity_xref"
    __table_args__ = { "schema": "now_submissions" }
    messageid = db.Column(db.Integer, db.ForeignKey('application.messageid'))
    placeractivityid = db.Column(db.Integer, db.ForeignKey('placer_activity.placeractivityid'))


    def __repr__(self):
        return '<ProposedPlacerActivityXref %r>' % self.messageid

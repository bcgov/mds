from sqlalchemy.schema import FetchedValue
from app.api.utils.models_mixins import Base
from app.extensions import db


class SandGrvQryActivity(Base):
    __tablename__ = "sand_grv_qry_activity"
    __table_args__ = {"schema": "now_submissions"}
    id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    messageid = db.Column(db.Integer, db.ForeignKey('now_submissions.application.messageid'))
    type = db.Column(db.String)
    disturbedarea = db.Column(db.Numeric(14, 2))
    timbervolume = db.Column(db.Numeric(14, 2))

    def __repr__(self):
        return '<SandGrvQryActivity %r>' % self.id

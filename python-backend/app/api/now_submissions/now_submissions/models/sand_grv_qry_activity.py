from ....utils.models_mixins import Base
from app.extensions import db


class NOWSandGrvQryActivity(Base):
    __tablename__ = "sand_grv_qry_activity"
    __table_args__ = { "schema": "now_submissions" }
    id = db.Column(db.Integer, primary_key=True)
    messageid = db.Column(db.Integer, db.ForeignKey('application.messageid'))
    type = db.Column(db.String)
    disturbedarea = db.Column(db.Numeric(14,2))
    timbervolume = db.Column(db.Numeric(14,2))


    def __repr__(self):
        return '<NOWSandGrvQryActivity %r>' % self.id

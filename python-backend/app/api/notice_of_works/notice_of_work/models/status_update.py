from ....utils.models_mixins import Base
from app.extensions import db


class NOWStatusUpdate(Base):
    __tablename__ = "status_update"
    __table_args__ = { "schema": "now_submissions" }
    id = db.Column(db.Integer, primary_key=True)
    businessareanumber = db.Column(db.String)
    status = db.Column(db.String)
    statusupdatedate = db.Column(db.DateTime)
    processed = db.Column(db.String)
    processeddate = db.Column(db.DateTime)
    requeststatus = db.Column(db.String)
    requestmessage = db.Column(db.String)
    seqnum = db.Column(db.Integer)
    statusreason = db.Column(db.String)
    applicationtype = db.Column(db.String)

    def __repr__(self):
        return '<NOWClient %r>' % self.clientid

from app.api.utils.models_mixins import Base
from app.extensions import db


class MMSApplicationNDA(Base):
    __tablename__ = "application_nda"
    __table_args__ = {"schema": "mms_now_submissions"}
    id = db.Column(db.Integer, primary_key=True)
    messageid = db.Column(db.Integer, db.ForeignKey('mms_now_submissions.application.messageid'))
    mms_cid = db.Column(db.Integer)
    trackingnumber = db.Column(db.Integer)
    applicationtype = db.Column(db.String)
    status = db.Column(db.String)
    submitteddate = db.Column(db.DateTime)
    receiveddate = db.Column(db.DateTime)
    applicantclientid = db.Column(db.Integer)
    submitterclientid = db.Column(db.Integer)
    typedeemedauthorization = db.Column(db.String)
    permitnumber = db.Column(db.String)
    minenumber = db.Column(db.String)
    nownumber = db.Column(db.String)
    planactivitiesdrillprogram = db.Column(db.String)
    planactivitiesipsurvey = db.Column(db.String)
    proposedstartdate = db.Column(db.DateTime)
    proposedenddate = db.Column(db.DateTime)
    totallinekilometers = db.Column(db.Integer)
    descplannedactivities = db.Column(db.String)
    proposednewenddate = db.Column(db.DateTime)
    reasonforextension = db.Column(db.String)
    anyotherinformation = db.Column(db.String)
    vfcbcapplicationurl = db.Column(db.String)

    def __repr__(self):
        return '<ApplicationNDA %r>' % self.id

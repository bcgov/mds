from ....utils.models_mixins import Base
from app.extensions import db


class ApplicationNDA(Base):
    __tablename__ = "application_nda"
    __table_args__ = { "schema": "now_submissions" }
    messageid = db.Column(db.Integer, primary_key=True)
    trackingnumber = db.Column(db.Integer)
    applicationtype = db.Column(db.String)
    status = db.Column(db.String)
    submitteddate = db.Column(db.DateTime)
    receiveddate = db.Column(db.DateTime)
    applicantclientid = db.Column(db.Integer, db.ForeignKey('client.clientid'))
    submitterclientid = db.Column(db.Integer, db.ForeignKey('client.clientid'))
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
    messagecreateddate = db.Column(db.DateTime)
    processed = db.Column(db.String)
    processeddate = db.Column(db.DateTime)
    nrsosapplicationid = db.Column(db.String)


    def __repr__(self):
        return '<ApplicationNDA %r>' % self.messageid

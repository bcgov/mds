from app.api.utils.models_mixins import Base
from app.extensions import db


class MMSContact(Base):
    __tablename__ = "contact"
    __table_args__ = {"schema": "mms_now_submissions"}
    id = db.Column(db.Integer, primary_key=True)
    messageid = db.Column(db.Integer, db.ForeignKey('mms_now_submissions.application.messageid'))
    mms_cid = db.Column(db.Integer)
    org_legalname = db.Column(db.String)
    ind_firstname = db.Column(db.String)
    ind_lastname = db.Column(db.String)
    ind_phonenumber = db.Column(db.String)
    dayphonenumber = db.Column(db.String)
    dayphonenumberext = db.Column(db.String)
    faxnumber = db.Column(db.String)
    email = db.Column(db.String)
    org_contactname = db.Column(db.String)
    mailingaddressline1 = db.Column(db.String)
    contacttype = db.Column(db.String)
    mailingaddresscity = db.Column(db.String)
    mailingaddressprovstate = db.Column(db.String)
    mailingaddresspostalzip = db.Column(db.String)

    def __repr__(self):
        return '<MMSContact %r>' % self.id

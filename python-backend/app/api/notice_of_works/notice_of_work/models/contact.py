from ....utils.models_mixins import Base
from app.extensions import db


class NOWContact(Base):
    __tablename__ = "contact"
    __table_args__ = { "schema": "now_submissions" }
    id = db.Column(db.Integer, primary_key=True)
    messageid = db.Column(db.Integer)
    type = db.Column(db.String)
    org_legalname = db.Column(db.String)
    org_doingbusinessas = db.Column(db.String)
    ind_firstname = db.Column(db.String)
    ind_lastname = db.Column(db.String)
    ind_middlename = db.Column(db.String)
    ind_phonenumber = db.Column(db.String)
    dayphonenumber = db.Column(db.String)
    dayphonenumberext = db.Column(db.String)
    faxnumber = db.Column(db.String)
    email = db.Column(db.String)
    org_bcfedincorpnumber = db.Column(db.String)
    org_bcregnumber = db.Column(db.String)
    org_societynumber = db.Column(db.String)
    org_hstregnumber = db.Column(db.String)
    org_contactname = db.Column(db.String)
    mailingaddressline1 = db.Column(db.String)
    contacttype = db.Column(db.String)
    contactcertificationtype = db.Column(db.String)
    contactcertificationid = db.Column(db.String)
    mailingaddressline2 = db.Column(db.String)
    mailingaddresscity = db.Column(db.String)
    mailingaddressprovstate = db.Column(db.String)
    mailingaddresscountry = db.Column(db.String)
    mailingaddresspostalzip = db.Column(db.String)
    seq_no = db.Column(db.Integer)

    # FOREIGN KEY (MESSAGEID) REFERENCES NOW_Submissions.application(MESSAGEID) DEFERRABLE INITIALLY DEFERRED

    def __repr__(self):
        return '<NOWContact %r>' % self.id

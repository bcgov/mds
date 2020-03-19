from app.api.utils.models_mixins import Base
from app.extensions import db


class Client(Base):
    __tablename__ = "client"
    __table_args__ = {"schema": "now_submissions"}
    clientid = db.Column(db.Integer, primary_key=True)
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
    mailingaddressline2 = db.Column(db.String)
    mailingaddresscity = db.Column(db.String)
    mailingaddressprovstate = db.Column(db.String)
    mailingaddresscountry = db.Column(db.String)
    mailingaddresspostalzip = db.Column(db.String)

    def __repr__(self):
        return '<Client %r>' % self.clientid

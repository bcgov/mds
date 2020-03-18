from sqlalchemy.schema import FetchedValue
from marshmallow import fields, validate

from app.api.utils.models_mixins import Base
from app.extensions import db
from app.api.constants import type_of_contact_map


class Contact(Base):
    __tablename__ = "contact"
    __table_args__ = {"schema": "now_submissions"}

    class _ModelSchema(Base._ModelSchema):
        id = fields.String(dump_only=True)
        contacttype = fields.String(validate=validate.OneOf(choices=type_of_contact_map.keys()))

    id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    messageid = db.Column(db.Integer, db.ForeignKey('now_submissions.application.messageid'))
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

    def __repr__(self):
        return '<Contact %r>' % self.id

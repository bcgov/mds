from datetime import datetime
from app.extensions import db, api
from flask_restx import fields
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base

NONCOMPLIANCE_RESPONSE_MODEL = api.model('noncompliance_permit', {
    'section_number': fields.String,
    'section_title': fields.String,
    'section_text': fields.String,
})


class NonCompliancePermit(Base):
    __tablename__ = "noncompliance_permit"
    __table_args__ = {
        'comment':
        'For an issued order, this table contains the additional details about the permit conditions found to be in non-compliance.'
    }
    noncompliance_permit_id = db.Column(db.Integer, primary_key=True)
    order_stop_detail_id = db.Column(db.Integer,
                                     db.ForeignKey('order_stop_detail.order_stop_detail_id'))
    section_number = db.Column(db.String(10485760))
    section_title = db.Column(db.String(10485760))
    section_text = db.Column(db.String())

    def __repr__(self):
        return f'<NonCompliancePermit noncompliance_permit_id={self.noncompliance_permit_id} section_number={self.section_number}>'

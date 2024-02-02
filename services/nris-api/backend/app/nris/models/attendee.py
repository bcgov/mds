from app.extensions import db, api
from flask_restx import fields
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base

from app.nris.models.document import DOCUMENT_RESPONSE_MODEL

ATTENDEE_RESPONSE_MODEL = api.model(
    'attendee', {
        'first_name': fields.String,
        'last_name': fields.String,
        'org': fields.String,
        'attendee_type': fields.String,
        'title': fields.String,
    })


class Attendee(Base):
    __tablename__ = "attendee"
    __table_args__ = {'comment': 'Any attendee on an inspection.'}
    attendee_id = db.Column(db.Integer, primary_key=True)
    inspection = db.relationship('Inspection', lazy='selectin')
    inspection_id = db.Column(
        db.Integer, db.ForeignKey('inspection.inspection_id'))

    first_name = db.Column(db.String())
    last_name = db.Column(db.String())
    org = db.Column(db.String())
    title = db.Column(db.String())
    attendee_type_id = db.Column(
        db.Integer, db.ForeignKey('attendee_type.attendee_type_id'))
    attendee_type_rel = db.relationship('AttendeeType', lazy='selectin')
    attendee_type = association_proxy('attendee_type_rel', 'attendee_type')

    def __repr__(self):
        return f'<Attendee attendee_id={self.attendee_id} name={self.first_name} {self.last_name}>'

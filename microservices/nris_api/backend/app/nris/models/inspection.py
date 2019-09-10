from datetime import datetime
from app.extensions import db, api
from flask_restplus import fields
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base

from app.nris.models.inspection_status import InspectionStatus
from app.nris.models.inspected_location import INSPECTED_LOCATION_RESPONSE_MODEL
from app.nris.models.document import DOCUMENT_RESPONSE_MODEL

INSPECTION_RESPONSE_MODEL = api.model(
    'inspection', {
        'external_id': fields.Integer,
        'inspection_date': fields.DateTime,
        'completed_date': fields.DateTime,
        'inspection_status_code': fields.String,
        'inspection_type_code': fields.String,
        'inspection_report_sent_date': fields.DateTime,
        'inspection_from_date': fields.DateTime,
        'inspection_to_date': fields.DateTime,
        'business_area': fields.String,
        'mine_no': fields.String,
        'inspector_idir': fields.String,
        'inspection_introduction': fields.String,
        'inspection_preamble': fields.String,
        'inspection_closing': fields.String,
        'officer_notes': fields.String,
        'documents': fields.List(fields.Nested(DOCUMENT_RESPONSE_MODEL)),
        'inspected_locations': fields.List(fields.Nested(INSPECTED_LOCATION_RESPONSE_MODEL)),
    })


class Inspection(Base):
    __tablename__ = "inspection"
    inspection_id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.Integer)
    inspection_date = db.Column(db.DateTime)
    completed_date = db.Column(db.DateTime)
    inspection_report_sent_date = db.Column(db.DateTime)
    inspection_status_id = db.Column(db.Integer,
                                     db.ForeignKey('inspection_status.inspection_status_id'))
    inspection_status = db.relationship("InspectionStatus")
    inspection_status_code = association_proxy('inspection_status', 'inspection_status_code')
    inspection_type_id = db.Column(db.Integer, db.ForeignKey('inspection_type.inspection_type_id'))
    inspection_type = db.relationship("InspectionType")
    inspection_type_code = association_proxy('inspection_type', 'inspection_type_code')
    inspection_from_date = db.Column(db.DateTime)
    inspection_to_date = db.Column(db.DateTime)

    business_area = db.Column(db.String(256))
    mine_no = db.Column(db.String(64))
    inspector_idir = db.Column(db.String(256))
    inspection_introduction = db.Column(db.String())
    inspection_preamble = db.Column(db.String())
    inspection_closing = db.Column(db.String())
    officer_notes = db.Column(db.String())
    documents = db.relationship('Document', lazy='selectin', secondary='inspection_document_xref')
    inspected_locations = db.relationship("InspectedLocation", lazy='joined')

    def __repr__(self):
        return f'<Inspection inspection_id={self.inspection_id} inspection_status_description={self.inspection_status_description}>'

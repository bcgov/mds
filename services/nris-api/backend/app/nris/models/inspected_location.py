from datetime import datetime
from app.extensions import db, api
from flask_restx import fields
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base

from app.nris.models.inspected_location_type import InspectedLocationType
from app.nris.models.document import DOCUMENT_RESPONSE_MODEL
from app.nris.models.location import LOCATION_RESPONSE_MODEL
from app.nris.models.order_advisory_detail import ADVISORY_DETAILS_RESPONSE_MODEL
from app.nris.models.order_request_detail import REQUEST_DETAILS_RESPONSE_MODEL
from app.nris.models.order_stop_detail import STOP_DETAILS_RESPONSE_MODEL
from app.nris.models.order_warning_detail import WARNING_DETAILS_RESPONSE_MODEL

INSPECTED_LOCATION_RESPONSE_MODEL = api.model(
    'inspected_location', {
        'inspected_location_type': fields.String,
        'location': fields.Nested(LOCATION_RESPONSE_MODEL),
        'documents': fields.List(fields.Nested(DOCUMENT_RESPONSE_MODEL)),
        'advisory_details': fields.List(fields.Nested(ADVISORY_DETAILS_RESPONSE_MODEL)),
        'request_details': fields.List(fields.Nested(REQUEST_DETAILS_RESPONSE_MODEL)),
        'stop_details': fields.List(fields.Nested(STOP_DETAILS_RESPONSE_MODEL)),
        'warning_details': fields.List(fields.Nested(WARNING_DETAILS_RESPONSE_MODEL)),
    })


class InspectedLocation(Base):
    __tablename__ = "inspected_location"
    __table_args__ = {
        'comment': 'Contains the high-level details of an observation(s) found during an inspection. Note, one observation is either a ""Stop"" or ""General"", each observation can result in one or more ""types of observations"", i.e. documents being issued (order, warning, advisory, request).'}
    inspected_location_id = db.Column(db.Integer, primary_key=True)
    inspection_id = db.Column(
        db.Integer, db.ForeignKey('inspection.inspection_id'))
    location_id = db.Column(db.Integer, db.ForeignKey('location.location_id'))
    location = db.relationship("Location", lazy='joined')

    inspected_location_type_id = db.Column(
        db.Integer, db.ForeignKey('inspected_location_type.inspected_location_type_id'))
    inspected_location_type_rel = db.relationship(
        'InspectedLocationType', lazy='selectin')
    inspected_location_type = association_proxy('inspected_location_type_rel',
                                                'inspected_location_type')
    documents = db.relationship('Document',
                                lazy='selectin',
                                secondary='inspected_location_document_xref')

    advisory_details = db.relationship('OrderAdvisoryDetail', lazy='joined')
    request_details = db.relationship('OrderRequestDetail', lazy='joined')
    stop_details = db.relationship('OrderStopDetail', lazy='joined')
    warning_details = db.relationship('OrderWarningDetail', lazy='joined')

    def __repr__(self):
        return f'<InspectedLocation inspected_location_id={self.inspected_location_id}>'

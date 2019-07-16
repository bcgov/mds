from datetime import datetime
from app.extensions import db, api
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base
from flask_restplus import fields

from app.nris.custom_types.sl_date_time import MyDateTime
from app.nris.models.document import DOCUMENT_RESPONSE_MODEL
from app.nris.models.noncompliance_legislation import NONCOMPLIANCE_LEGISLATION_RESPONSE_MODEL
from app.nris.models.noncompliance_permit import NONCOMPLIANCE_RESPONSE_MODEL

STOP_DETAILS_RESPONSE_MODEL = api.model(
    'order_stop_detail', {
        'detail':
        fields.String,
        'stop_type':
        fields.String,
        'response_status':
        fields.String,
        'stop_status':
        fields.String,
        'observation':
        fields.String,
        'response':
        fields.String,
        'response_received':
        fields.DateTime,
        'completion_date':
        fields.DateTime,
        'noncompliance_legislations':
        fields.List(fields.Nested(NONCOMPLIANCE_LEGISLATION_RESPONSE_MODEL)),
        'noncompliance_permits':
        fields.List(fields.Nested(NONCOMPLIANCE_RESPONSE_MODEL)),
        'authority_act':
        fields.String,
        'authority_act_section':
        fields.String,
        'documents':
        fields.List(fields.Nested(DOCUMENT_RESPONSE_MODEL)),
    })


class OrderStopDetail(Base):
    __tablename__ = "order_stop_detail"
    order_stop_detail_id = db.Column(db.Integer, primary_key=True)
    inspected_location_id = db.Column(db.Integer,
                                      db.ForeignKey('inspected_location.inspected_location_id'))
    detail = db.Column(db.String())
    stop_type = db.Column(db.String(256))
    response_status = db.Column(db.String(64))
    stop_status = db.Column(db.String(64))
    observation = db.Column(db.String())
    response = db.Column(db.String())
    response_received = db.Column(MyDateTime)
    completion_date = db.Column(MyDateTime)
    noncompliance_legislations = db.relationship("NonComplianceLegislation", lazy='joined')
    noncompliance_permits = db.relationship("NonCompliancePermit", lazy='joined')
    authority_act = db.Column(db.String(64))
    authority_act_section = db.Column(db.String(64))
    documents = db.relationship('Document',
                                lazy='selectin',
                                secondary='order_stop_detail_document_xref')

    def __repr__(self):
        return f'<OrderStopDetail order_stop_detail_id={self.order_stop_detail_id}> inspected_location_id={self.inspected_location_id}'

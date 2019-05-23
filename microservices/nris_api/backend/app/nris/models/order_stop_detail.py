from datetime import datetime
from app.extensions import db, api
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base
from flask_restplus import fields

from app.nris.models.document import DOCUMENT_RESPONSE_MODEL
from app.nris.models.legislation import LEGISLATION_RESPONSE_MODEL

STOP_DETAILS_RESPONSE_MODEL = api.model(
    'order_stop_detail', {
        'detail': fields.String,
        'stop_type': fields.String,
        'response_status': fields.String,
        'stop_status': fields.String,
        'observation': fields.String,
        'response': fields.String,
        'response_received': fields.Date,
        'completion_date': fields.Date,
        'legislations': fields.List(fields.Nested(LEGISLATION_RESPONSE_MODEL)),
        'authority_act': fields.String,
        'authority_act_section': fields.String,
        'documents': fields.List(fields.Nested(DOCUMENT_RESPONSE_MODEL)),
    })


class OrderStopDetail(Base):
    __tablename__ = "order_stop_detail"
    order_stop_detail_id = db.Column(db.Integer, primary_key=True)
    inspection_order_id = db.Column(db.Integer, db.ForeignKey('nris.inspection_order.inspection_order_id'))
    detail = db.Column(db.String())
    stop_type = db.Column(db.String(256))
    response_status = db.Column(db.String(64))
    stop_status = db.Column(db.String(64))
    observation = db.Column(db.String())
    response = db.Column(db.String())
    response_received = db.Column(db.DateTime)
    completion_date = db.Column(db.DateTime)
    legislations = db.relationship("Legislation")
    authority_act = db.Column(db.String(64))
    authority_act_section = db.Column(db.String(64))
    documents = db.relationship(
        'Document', lazy='selectin', secondary='nris.order_stop_detail_document_xref')

    def __repr__(self):
        return f'<OrderStopDetail order_stop_detail_id={self.order_stop_detail_id}> inspection_order_id={self.inspection_order_id}'

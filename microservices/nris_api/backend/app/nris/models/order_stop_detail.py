from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base


class OrderStopDetail(Base):
    __tablename__ = "order_stop_detail"
    order_stop_detail_id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('nris.order.order_id'))
    detail = db.Column(db.String(2048))
    stop_type = db.Column(db.String(256))
    response_status = db.Column(db.String(64))
    stop_status = db.Column(db.String(64))
    observation = db.Column(db.String(2048))
    response = db.Column(db.String(2048))
    response_received = db.Column(db.DateTime)
    legislations = db.relationship("Legislation")
    authority_act = db.Column(db.String(64))
    authority_act_section = db.Column(db.String(64))

    def __repr__(self):
        return f'<OrderStopDetail order_stop_detail_id={self.order_stop_detail_id}> order_id={self.order_id}'

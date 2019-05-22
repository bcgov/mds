from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base


class OrderType(Base):
    __tablename__ = "order_type"
    order_type_id = db.Column(db.Integer, primary_key=True)
    order_type = db.Column(db.String(256))

    def __repr__(self):
        return f'<OrderType order_type_id={self.order_type_id} order_type={self.order_type}>'

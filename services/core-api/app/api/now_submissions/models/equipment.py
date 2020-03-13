from sqlalchemy.schema import FetchedValue
from app.api.utils.models_mixins import Base
from app.extensions import db


class EquipmentSubmission(Base):
    __tablename__ = "equipment"
    __table_args__ = {"schema": "now_submissions"}
    equipmentid = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    type = db.Column(db.String)
    sizecapacity = db.Column(db.String)
    quantity = db.Column(db.Integer)

    def __repr__(self):
        return '<EquipmentSubmission %r>' % self.equipmentid

from ....utils.models_mixins import Base
from app.extensions import db


class Equipment(Base):
    __tablename__ = "equipment"
    __table_args__ = { "schema": "now_submissions" }
    equipmentid = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String)
    sizecapacity = db.Column(db.String)
    quantity = db.Column(db.Integer)

    def __repr__(self):
        return '<Equipment %r>' % self.equipmentid

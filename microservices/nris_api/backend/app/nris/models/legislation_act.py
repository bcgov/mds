from datetime import datetime
from app.extensions import db, api
from flask_restplus import fields
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from app.nris.utils.base_model import Base


class LegislationAct(Base):
    __tablename__ = "legislation_act"
    legislation_act_id = db.Column(db.Integer, primary_key=True)
    act = db.Column(db.String(256))
    sections = db.relationship("LegislationActSection")

    def __repr__(self):
        return f'<LegislationAct legislation_act_id={self.legislation_act_id}>'

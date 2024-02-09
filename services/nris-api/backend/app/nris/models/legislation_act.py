from datetime import datetime
from app.extensions import db, api
from flask_restx import fields
from sqlalchemy.orm import validates
from app.nris.utils.base_model import Base


class LegislationAct(Base):
    __tablename__ = "legislation_act"
    __table_args__ = {
        'comment':
        'Lookup table that contains a list of legislated Acts; i.e. "Mines Act", "Health, Safety and Reclamation Code for Mines in BC", "Mineral Tenure Act".'
    }
    legislation_act_id = db.Column(db.Integer, primary_key=True)
    act = db.Column(db.String(10485760))
    sections = db.relationship("LegislationActSection")

    def __repr__(self):
        return f'<LegislationAct legislation_act_id={self.legislation_act_id}>'

    @classmethod
    def find_all_legislation_acts(cls):
        return cls.query.all()

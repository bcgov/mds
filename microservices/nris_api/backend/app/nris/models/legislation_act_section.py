from datetime import datetime
from app.extensions import db, api
from flask_restplus import fields
from sqlalchemy.orm import validates
from app.nris.utils.base_model import Base


class LegislationActSection(Base):
    __tablename__ = "legislation_act_section"
    legislation_act_section_id = db.Column(db.Integer, primary_key=True)
    legislation_act_id = db.Column(db.Integer,
                                   db.ForeignKey('nris.legislation_act.legislation_act_id'))
    section = db.Column(db.String(64))

    def __repr__(self):
        return f'<LegislationActSection legislation_act_section_id={self.legislation_act_section_id} section={self.section}>'

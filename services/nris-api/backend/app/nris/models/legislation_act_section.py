from datetime import datetime
from app.extensions import db, api
from flask_restx import fields
from sqlalchemy.orm import validates
from app.nris.utils.base_model import Base


class LegislationActSection(Base):
    __tablename__ = "legislation_act_section"
    __table_args__ = {
        'comment':
        'Contains a list of sections (or provisions of the act); i.e. "1.9.1", "1.5.1", etc.'
    }
    legislation_act_section_id = db.Column(db.Integer, primary_key=True)
    legislation_act_id = db.Column(db.Integer, db.ForeignKey('legislation_act.legislation_act_id'))
    section = db.Column(db.String(10485760))

    def __repr__(self):
        return f'<LegislationActSection legislation_act_section_id={self.legislation_act_section_id} section={self.section}>'

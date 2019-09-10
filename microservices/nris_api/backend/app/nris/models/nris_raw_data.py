from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from app.nris.utils.base_model import Base


class NRISRawData(Base):
    __table_args__ = {'comment': 'Contains the raw XML data pulled in from the CORS_CV_ASSESSMENTS_XVW view from the NRIS database. The nris_data is then parsed out into the relational based tables within the nris schema for easier reporting and data output.'}
    id = db.Column(db.Integer, primary_key=True)
    nris_data = db.Column(db.Text)
    input_date = db.Column(db.DateTime, nullable=False, default=datetime.now())
    processed_date = db.Column(db.DateTime)

    def __repr__(self):
        return f'<id={self.id} NRISRawData({self.nris_data})>'

    @classmethod
    def create(cls, nris_data, add_to_session=True):
        data = cls(nris_data=nris_data)
        return data

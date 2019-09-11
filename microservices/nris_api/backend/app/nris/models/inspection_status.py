from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from app.nris.utils.base_model import Base


class InspectionStatus(Base):
    __tablename__ = "inspection_status"
    __table_args__ = {
        'comment': 'Lookup table that contains a list of inspection statuses. For example; Complete, Incomplete.'}
    inspection_status_id = db.Column(db.Integer, primary_key=True)
    inspection_status_code = db.Column(db.String(32), nullable=False)
    inspection_status_description = db.Column(db.String(256))

    def __repr__(self):
        return f'<InspectionStatus inspection_status_code={self.inspection_status_code} inspection_status_description={self.inspection_status_description}>'

    @classmethod
    def find_all_inspection_status(cls):
        return cls.query.all()

from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from app.nris.utils.base_model import Base


class InspectionSubstatus(Base):
    __tablename__ = "inspection_substatus"
    __table_args__ = {
        'comment': 'Lookup table that contains a list of inspection substatuses. E.g. Open, Closed, Report Sent, Response Recieved, '}
    inspection_substatus_id = db.Column(db.Integer, primary_key=True)
    inspection_substatus_code = db.Column(db.String(32), nullable=False)
    inspection_substatus_description = db.Column(db.String(256))

    def __repr__(self):
        return f'<InspectionStatus inspection_status_code={self.inspection_substatus_code} inspection_status_description={self.inspection_substatus_description}>'

    @classmethod
    def find_all_inspection_substatus(cls):
        return cls.query.all()

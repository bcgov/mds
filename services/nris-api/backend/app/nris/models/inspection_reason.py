from app.extensions import db
from sqlalchemy.orm import validates
from app.nris.utils.base_model import Base


class InspectionReason(Base):
    __tablename__ = "inspection_reason"
    __table_args__ = {
        'comment': 'Lookup table that contains a list of inspection reasons. E.g. Planned, Unplanned, Compliant, Non-compliance report'}
    inspection_reason_id = db.Column(db.Integer, primary_key=True)
    inspection_reason_code = db.Column(db.String(32), nullable=False)
    inspection_reason_description = db.Column(db.String(256))

    def __repr__(self):
        return f'<InspectionReason inspection_reason_code={self.inspection_reason_code} inspection_reason_description={self.inspection_reason_description}>'

    @classmethod
    def find_all_inspection_reason(cls):
        return cls.query.all()

from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from app.nris.utils.base_model import Base


class InspectionType(Base):
    __tablename__ = "inspection_type"
    __table_args__ = {
        'comment': 'Categories of mine inspection types. This most directly related to the type of inspector and does not constrain potential resulting orders.'}
    inspection_type_id = db.Column(db.Integer, primary_key=True)
    inspection_type_code = db.Column(db.String(32), nullable=False)
    inspection_type_description = db.Column(db.String(256))

    def __repr__(self):
        return f'<InspectionType inspection_type_code={self.inspection_type_code} inspection_type_description={self.inspection_type_description}>'

    @classmethod
    def find_all_inspection_types(cls):
        return cls.query.all()

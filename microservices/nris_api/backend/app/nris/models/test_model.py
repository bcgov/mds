from datetime import datetime
from app.extensions import db
from sqlalchemy.orm import validates
from app.nris.utils.base_model import Base

db.metadata.clear()


class Factorial(Base):
    id = db.Column(db.Integer, primary_key=True)
    input_val = db.Column(db.Integer, nullable=False, unique=True)
    output_val = db.Column(db.Integer, nullable=False)
    exec_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now())

    def __repr__(self):
        return f'<id={self.id} Factorial({self.input_val}) = {self.output_val} @ {self.exec_timestamp}>'

    @validates('output_val')
    def valid_output_val(self, key, val):
        if val < 1:
            AssertionError("output_val must be positive")
        if float(val) != val:
            AssertionError("output_val must be an integer")
        return val
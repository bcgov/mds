from datetime import datetime
from app.extensions import db


class FactorialRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    input_val = db.Column(db.Integer, nullable=False, unique=True)
    output_val = db.Column(db.Integer, nullable=False)
    exec_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.now())

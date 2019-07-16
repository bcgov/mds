from datetime import datetime
from app.extensions import db

class MyDateTime(db.TypeDecorator):
    impl = db.DateTime

    def process_bind_param(self, value, dialect):
        if type(value) is str:
            return datetime.strptime(value[:10], '%Y-%m-%d')
        return value

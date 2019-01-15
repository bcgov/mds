from datetime import datetime

from sqlalchemy.exc import DBAPIError

from app.extensions import db


class Base(db.Model):
    __abstract__ = True

    def save(self, commit=True):
        db.session.add(self)
        if commit:
            try:
                db.session.commit()
            except DBAPIError:
                db.session.rollback()
                raise


class AuditMixin(object):
    create_user = db.Column(db.String(60), nullable=False)
    create_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    update_user = db.Column(db.String(60), nullable=False)
    update_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
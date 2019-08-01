from datetime import datetime
from flask import current_app
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from .include.user_info import User


class Base(db.Model):
    __abstract__ = True

    def save(self, commit=True):
        db.session.add(self)
        if commit:
            try:
                db.session.commit()
            except SQLAlchemyError as e:
                db.session.rollback()
                raise e


class AuditMixin(object):
    create_user = db.Column(db.String(60), nullable=False, default=User().get_user_username)
    create_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    update_user = db.Column(db.String(60),
                            nullable=False,
                            default=User().get_user_username,
                            onupdate=User().get_user_username)
    update_timestamp = db.Column(db.DateTime,
                                 nullable=False,
                                 default=datetime.utcnow,
                                 onupdate=datetime.utcnow)

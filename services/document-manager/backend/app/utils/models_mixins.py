from datetime import datetime

from app.extensions import db
from celery import current_task
from flask import current_app, has_request_context
from sqlalchemy.exc import SQLAlchemyError

from .include.user_info import User


def get_audit_user():
    # Return the username of the current authenticated user, to be used for auditing purposes (create_user, update_user).
    # If running as part of a celery task, there's no request context (no authenticated user),
    # so use 'mds' as the audit user.
    if current_task and not has_request_context():
        return 'mds'
    return User().get_user_username()


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
    create_user = db.Column(db.String(60), nullable=False, default=get_audit_user)
    create_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    update_user = db.Column(db.String(60),
                            nullable=False,
                            default=get_audit_user,
                            onupdate=get_audit_user)
    update_timestamp = db.Column(db.DateTime,
                                 nullable=False,
                                 default=datetime.utcnow,
                                 onupdate=datetime.utcnow)

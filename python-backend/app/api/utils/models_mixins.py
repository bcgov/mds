from datetime import datetime

from sqlalchemy.exc import DBAPIError
from sqlalchemy import or_
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.extensions import db


class UserBoundQuery(db.Query):
    current_user_constrained = True

    def user_unconstrained_unsafe(self):
        rv = self._clone()
        rv.current_user_constrained = False
        return rv


@db.event.listens_for(UserBoundQuery, 'before_compile', retval=True)
def ensure_user_constrained(query):
    for desc in query.column_descriptions:
        if hasattr(desc['type'], 'mine_guid') and query.current_user_constrained:
            query = query.enable_assertions(False).filter_by(
                mine_guid='2c6c8e31-e56f-4982-87e9-044cefc8b0b3')

    return query


class Base(db.Model):
    __abstract__ = True
    query_class = UserBoundQuery

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

from datetime import datetime

from sqlalchemy.exc import DBAPIError
from sqlalchemy import or_
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID

from app.extensions import db


class UserBoundQuery(db.Query):
    user_constrained = True

    def unconstrained_unsafe(self):
        rv = self._clone()
        rv.user_constrained = False
        return rv


@db.event.listens_for(UserBoundQuery, 'before_compile', retval=True)
def ensure_constrained(query):
    from ... import auth

    if not query.user_constrained:
        return query

    mzero = query._mapper_zero()
    if mzero is not None:
        tenant = auth.get_current_tenant()

        #use reflection to get current model
        cls = mzero.class_

        #if query includes mine_guid, apply filter on mine_guid
        #NOTE: this may not work when using .with_entities . For our purposes, this should be fine. Try
        #if (cls.hasattr('mine_guid')):
        for desc in query.column_descriptions:
            if hasattr(desc['type'], 'mine_guid') and query.user_constrained:
                query = query.enable_assertions(False).filter(cls.mine_guid.in_(tenant.mine_ids))

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

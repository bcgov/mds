from datetime import datetime

from sqlalchemy.exc import DBAPIError

from app.extensions import db


class UserBoundQuery(db.Query):
    user_bound = True

    #for use when intentionally needing to make an unsafe query
    def unbound_unsafe(self):
        rv = self._clone()
        rv.user_bound = False
        return rv


#add listener for the before_compile event on UserBoundQuery
@db.event.listens_for(UserBoundQuery, 'before_compile', retval=True)
def ensure_constrained(query):
    from ... import auth

    if not query.user_bound:
        return query

    mzero = query._mapper_zero()
    if mzero is not None:
        user_security = auth.get_current_user_security()

        if user_security.is_restricted():
            #use reflection to get current model
            cls = mzero.class_

            #if model includes mine_guid, apply filter on mine_guid.
            if hasattr(cls, 'mine_guid') and query.user_bound:
                query = query.enable_assertions(False).filter(
                    cls.mine_guid.in_(user_security.mine_ids))

    return query


class Base(db.Model):
    __abstract__ = True
    #set default query_class on base class
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

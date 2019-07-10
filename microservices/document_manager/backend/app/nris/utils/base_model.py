import sqlalchemy

from app.extensions import db, migrate


class Base(db.Model):

    __abstract__ = True

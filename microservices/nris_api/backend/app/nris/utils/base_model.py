import sqlalchemy

from app.extensions import db, migrate


class Base(db.Model):

    __abstract__ = True
    #__table_args__ = {'schema': 'nris'}  #, "extend_existing": True}

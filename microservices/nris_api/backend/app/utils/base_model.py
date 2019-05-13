from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.schema import MetaData
import sqlalchemy

from app.extensions import db, migrate

from flask import current_app

metadata = MetaData(schema='nris')

Base = declarative_base(metadata=metadata, name='NRISBase')

sqlalchemy.event.listen(
    Base.metadata, 'before_create',
    sqlalchemy.DDL("CREATE SCHEMA IF NOT EXISTS {schema}".format(schema=metadata.schema)))
#TODO: flyway is doing this, but it won't hurt to have this year if nris db user has permission.

class Base(db.Model):
    __abstract__ = True

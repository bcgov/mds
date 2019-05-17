import uuid
from datetime import datetime
from sqlalchemy.orm.scoping import scoped_session

import factory
import factory.fuzzy

from app.extensions import db

# import SQLAlchemy model

GUID = factory.LazyFunction(uuid.uuid4)
TODAY = factory.LazyFunction(datetime.now)

FACTORY_LIST = []


class FactoryRegistry:
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        FACTORY_LIST.append(cls)


class BaseFactory(factory.alchemy.SQLAlchemyModelFactory, FactoryRegistry):
    class Meta:
        abstract = True
        sqlalchemy_session = db.session
        sqlalchemy_session_persistence = 'flush'

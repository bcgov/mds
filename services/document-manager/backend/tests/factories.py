import uuid
from datetime import datetime
from os import path
from sqlalchemy.orm.scoping import scoped_session

import factory
import factory.fuzzy

from app.extensions import db

from app.docman.models.document import Document

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


class DocumentFactory(BaseFactory):
    class Meta:
        model = Document

    class Params:
        path_root = ''

    document_guid = GUID
    full_storage_path = factory.LazyAttribute(lambda o: path.join(o.path_root, 'mine_no/category', o
                                                                  .file_display_name))
    upload_started_date = TODAY
    upload_completed_date = TODAY
    file_display_name = factory.Faker('file_name')
    path_display_name = factory.LazyAttribute(lambda o: path.join(o.path_root, 'mine_name/category',
                                                                  o.file_display_name))
    object_store_path = None
    status = 'Success'

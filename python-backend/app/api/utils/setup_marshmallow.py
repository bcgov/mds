from flask import current_app

import sqlalchemy as sa
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker, mapper
from sqlalchemy import event
from sqlalchemy.orm.attributes import InstrumentedAttribute
from marshmallow import fields
from marshmallow_sqlalchemy import ModelConversionError, ModelSchema, ModelConverter
from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db
from geoalchemy2 import Geometry


class CoreConverter(ModelConverter):
    SQLA_TYPE_MAPPING = ModelConverter.SQLA_TYPE_MAPPING.copy()
    SQLA_TYPE_MAPPING.update({Geometry: fields.String, sa.Numeric: fields.Number})


# class BaseMeta:
#     ordered = True
#     sqla_session = db.session
#     model_converter = CoreConverter
#     exclude = ('create_user', 'create_timestamp', 'update_user', 'update_timestamp')


def setup_schema(Base, session):
    # Create a function which incorporates the Base and session information
    def setup_schema_fn():
        # print(f'modules that inherit from base {list(Base._decl_class_registry.values())}')
        for class_ in Base._decl_class_registry.values():
            if hasattr(class_, "__tablename__"):
                try:
                    if class_.__name__.endswith("Schema"):
                        raise ModelConversionError("For safety, setup_schema can not be used when a"
                                                   "Model class ends with 'Schema'")

                    class Meta(object):
                        model = class_
                        ordered = True
                        include_fk = True
                        sqla_session = db.session
                        model_converter = CoreConverter
                        exclude = ('create_user', 'create_timestamp', 'update_user',
                                   'update_timestamp')

                    schema_class_name = "%sSchema" % class_.__name__

                    #current_app.logger.debug(
                    schema_class = type(schema_class_name, (ModelSchema, ), {"Meta": Meta})

                    setattr(class_, "_schema", schema_class)
                    print(f'created {class_}')
                except Exception as e:
                    raise e

    return setup_schema_fn


#event.listen(mapper, "after_configured", setup_schema(Base, db.session))
#Base.metadata.create_all(db.engine.connect())
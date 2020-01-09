# import json

import sqlalchemy as sa
import itertools

from uuid import UUID as py_uuid
from flask import current_app
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker, mapper
from sqlalchemy import event
from sqlalchemy.inspection import inspect
from sqlalchemy.orm.attributes import InstrumentedAttribute
from marshmallow import fields, pprint
from marshmallow_sqlalchemy import ModelConversionError, ModelSchema, ModelConverter
from app.api.utils.models_mixins import AuditMixin, Base as BaseModel
from app.extensions import db
from geoalchemy2 import Geometry

from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase
from app.api.now_applications.models.equipment import Equipment
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from sqlalchemy.dialects.postgresql import UUID


class CoreConverter(ModelConverter):
    SQLA_TYPE_MAPPING = ModelConverter.SQLA_TYPE_MAPPING.copy()
    SQLA_TYPE_MAPPING.update({
        Geometry: fields.String,
        sa.Numeric: fields.Number,
                                                 # py_uuid: fields.UUID
    })


# class UUIDEncoder(json.JSONEncoder):
#     def default(self, obj):
#         raise Exception('found python uuid.UUID')
#         if isinstance(obj, UUID):
#             # if the obj is uuid, we simply return the value of uuid
#             return obj.hex
#         return json.JSONEncoder.default(self, obj)

# class BaseMeta:
#     ordered = True
#     sqla_session = db.session
#     model_converter = CoreConverter
#     exclude = ('create_user', 'create_timestamp', 'update_user', 'update_timestamp')

# class SmartNested(fields.Nested):
#     def serialize(self, attr, obj, accessor=None):
#         print(attr + str(obj.__dict__))
#         if attr not in obj.__dict__:
#             pprint(f'new {attr} ->' + str(obj.__class__))
#         else:
#             pprint(f'{attr} already loaded -> ' + str(obj.__class__))
#         return super(SmartNested, self).serialize(attr, obj, accessor)


def setup_schema(Base, session):
    """
    inspired by: https://marshmallow-sqlalchemy.readthedocs.io/en/latest/recipes.html#automatically-generating-schemas-for-sqlalchemy-models
    """
    def setup_schema_fn():
        for class_ in ActivityDetailBase.__subclasses__() + [Equipment, NOWApplicationDocumentXref]:
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

                    class ModelSchema2(ModelSchema):
                        activity_type_code = fields.String(dump_only=True)
                        activity_detail_id = fields.Integer(dump_only=True)

                    schema_class = type(schema_class_name, (ModelSchema2, ), {"Meta": Meta})

                    setattr(class_, "_schema", schema_class)
                    print(f'created {class_}')
                except Exception as e:
                    raise e

        # for class_ in Base._decl_class_registry.values():
        #     if hasattr(class_, "_schema"):
        #         pprint(class_.__name__)
        #         try:
        #             mapper = inspect(class_)

        #             for rel in mapper.relationships:
        #                 pprint(rel.foreign_keys)
        #                 if rel.property:
        #                     pprint('  ' + rel.key)

        #                     #raise Exception()
        #                     class_._schema._declared_fields[rel.key] = fields.Nested(
        #                         rel.entity.class_._schema, many=rel.uselist, dump_only=True)
        #                     #exclude=[rel.backref.key] + [pk.name for pk in mapper.primary_keys])
        #         except Exception as e:
        #             raise e

    return setup_schema_fn


# TODO: finish this and resolve errors now_application/activity_detail_base.activity_type_code to all for programatic generation of schema
# TODO: add call to model method to execute post_generation of schema.

event.listen(mapper, "after_configured", setup_schema(ActivityDetailBase, db.session))
# Base.metadata.create_all(db.engine.connect()) # i think this is not used
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
from marshmallow import fields, pprint, validate
from marshmallow_sqlalchemy import ModelConversionError, ModelSchema, ModelConverter
from app.api.utils.models_mixins import AuditMixin, Base as BaseModel
from app.extensions import db
from geoalchemy2 import Geometry
from sqlalchemy.dialects.postgresql import UUID

from app.api.now_applications.models.activity_detail.activity_detail_base import ActivityDetailBase
from app.api.now_applications.models.equipment import Equipment
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from app.api.now_submissions import models as sub_models
from app.api.utils.models_mixins import AuditMixin
from app.api.utils.static_data import setup_static_data
from app.api.utils.field_template import FieldTemplate
from app.api.constants import STATIC_DATA


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
AUDIT_COLUMNS = ('create_user', 'create_timestamp', 'update_user', 'update_timestamp')


def run_after_configure():
    setup_static_data(BaseModel)
    setup_schema(BaseModel, db.session)()


def setup_schema(Base, session):
    """
    inspired by: https://marshmallow-sqlalchemy.readthedocs.io/en/latest/recipes.html#automatically-generating-schemas-for-sqlalchemy-models
    """
    def setup_schema_fn():
        for class_ in ActivityDetailBase.__subclasses__() + [Equipment, NOWApplicationDocumentXref
                                                             ] + sub_models.model_list:
            if hasattr(class_, "__tablename__"):
                try:
                    if class_.__name__.endswith("Schema"):
                        raise ModelConversionError("For safety, setup_schema can not be used when a"
                                                   "Model class ends with 'Schema'")
                    exclude_columns = AUDIT_COLUMNS if AuditMixin in class_.__bases__ else ()

                    class Meta(object):
                        model = class_
                        ordered = True
                        include_fk = True
                        sqla_session = db.session
                        model_converter = CoreConverter
                        exclude = exclude_columns

                    # After the schema is created on the class this looks for any schemas that have deferred the creation of
                    # fields and validation. If found they are created and added to the proper schema.
                    for k, v in class_._ModelSchema.__dict__.items():
                        if type(v) == FieldTemplate:
                            current_app.logger.debug(f'creating field for {k} on {class_}')
                            class_._ModelSchema._declared_fields[k] = v.field(
                                validate=validate.OneOf(choices=STATIC_DATA[v.one_of]))
                    schema_class_name = "%sSchema" % class_.__name__
                    schema_class = type(schema_class_name, (class_._ModelSchema, ), {"Meta": Meta})

                    setattr(class_, "_schema", schema_class)
                    current_app.logger.debug(f'created schema for {class_}')
                except Exception as e:
                    raise e

        for class_ in Base._decl_class_registry.values():
            if hasattr(class_, "_schema"):
                try:
                    mapper = inspect(class_)
                    for rel in mapper.relationships:
                        if hasattr(rel.entity.class_, "_schema"):
                            current_app.logger.debug(
                                f'creating nested schema on relationship: {rel.key}')
                            class_._schema._declared_fields[rel.key] = fields.Nested(
                                rel.entity.class_._schema, many=rel.uselist)
                            #exclude=[rel.backref.key] + [pk.name for pk in mapper.primary_keys])
                except Exception as e:
                    raise e

    return setup_schema_fn


# TODO: finish this and resolve errors now_application/activity_detail_base.activity_type_code to all for programatic generation of schema

event.listen(mapper, "after_configured", run_after_configure)
# Base.metadata.create_all(db.engine.connect()) # i think this is not used
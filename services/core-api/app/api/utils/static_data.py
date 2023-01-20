from flask import current_app
from sqlalchemy.inspection import inspect
from sqlalchemy.dialects.postgresql import UUID

from app.api.now_applications import models as app_models
from app.api.constants import STATIC_DATA
""" 
This function is run right before setup_marshmallow and it looks through all of tables in our database.
It creates a mapping of classes to lists if their PK's, this is only done for code tables. To find the code tables
the classes are inspected and if they have a column named active_ind, it's type is not a UUID and its type is a string
the PK's are added to STATIC_DATA under the class name.
Parameters: Base <SQL Alchemy Model>
Return: None
"""


def setup_static_data(Base):
    for class_ in Base._decl_class_registry.values():
        if hasattr(class_, "__tablename__") or getattr(class_, "__create_schema__", False):

            try:
                mapper = inspect(class_)
                pk = mapper.primary_key[0]
                for col in mapper.columns:
                    if col.name == 'active_ind':
                        if type(pk.type) != UUID and pk.type.python_type == str:
                            STATIC_DATA[class_.__name__] = [
                                a for a, in class_.query.unbound_unsafe().with_entities(
                                    getattr(class_, pk.name, None)).filter_by(
                                        active_ind=True).all()
                            ]

                    # This section is specific to NoW_submissions. Some of the code values that NROS and vFCBC send are
                    # in long form so they are stored in the descriptions of the code tables so the descriptions of those
                    # tables are also added under a (class name)_description in STATIC_DATA.
                    if class_ in app_models.model_list and col.name == 'description':
                        if type(pk.type) != UUID and pk.type.python_type == str:
                            STATIC_DATA[f'{class_.__name__}_description'] = [
                                a for a, in class_.query.unbound_unsafe().with_entities(
                                    getattr(class_, 'description', None)).filter_by(
                                        active_ind=True).all()
                            ]

            except Exception as e:
                current_app.logger.error(class_.__name__)
                current_app.logger.error(str(e))
                raise e
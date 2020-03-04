from flask import current_app
from sqlalchemy.inspection import inspect
from sqlalchemy.dialects.postgresql import UUID

from app.api.now_applications import models as app_models

from app.api.constants import STATIC_DATA


def setup_static_data(Base):
    for class_ in Base._decl_class_registry.values():
        if hasattr(class_, "__tablename__"):
            try:
                mapper = inspect(class_)
                pk = mapper.primary_key[0]
                for col in mapper.columns:
                    if col.name == 'active_ind':
                        if type(pk.type) != UUID and pk.type.python_type == str:
                            STATIC_DATA[class_.__name__] = [
                                a for a, in class_.query.with_entities(
                                    getattr(class_, pk.name, None)).filter_by(
                                        active_ind=True).all()
                            ]

                    if class_ in app_models.model_list and col.name == 'description':
                        if type(pk.type) != UUID and pk.type.python_type == str:
                            current_app.logger.debug(class_)
                            STATIC_DATA[f'{class_.__name__}_description'] = [
                                a for a, in class_.query.with_entities(
                                    getattr(class_, 'description', None)).filter_by(
                                        active_ind=True).all()
                            ]

                    # if one of the now classes:
                    #     add descriptions to static data.

                    #exclude=[rel.backref.key] + [pk.name for pk in mapper.primary_keys])
            except Exception as e:
                raise e

    current_app.logger.debug(STATIC_DATA)

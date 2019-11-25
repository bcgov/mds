from datetime import datetime
from dateutil import parser
from flask import current_app
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.types import TypeEngine
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base

from app.extensions import db
from .include.user_info import User

from sqlalchemy.inspection import inspect
from flask_restplus import inputs


class UserBoundQuery(db.Query):
    _user_bound = True

    # for use when intentionally needing to make an unsafe query
    def unbound_unsafe(self):
        rv = self._clone()
        rv._user_bound = False
        return rv


# add listener for the before_compile event on UserBoundQuery
@db.event.listens_for(UserBoundQuery, 'before_compile', retval=True)
def ensure_constrained(query):
    from app import auth

    if not query._user_bound or not auth.apply_security:
        return query

    mzero = query._mapper_zero()
    if mzero is not None:
        user_security = auth.get_current_user_security()

        if user_security.is_restricted():
            # use reflection to get current model
            cls = mzero.class_

            # if model includes mine_guid, apply filter on mine_guid.
            if hasattr(cls, 'mine_guid') and query._user_bound:
                query = query.enable_assertions(False).filter(
                    cls.mine_guid.in_(user_security.mine_ids))

    return query


class DictLoadingError(Exception):
    """Raised when incoming type does not match expected type, prevents coalesing"""
    pass


class Base(db.Model):
    __abstract__ = True

    # Set default query_class on base class.
    query_class = UserBoundQuery

    def save(self, commit=True):
        db.session.add(self)
        if commit:
            try:
                db.session.commit()
            except SQLAlchemyError as e:
                db.session.rollback()
                raise e

    def deep_update_from_dict(self, data_dict, depth=0):
        """
        This function takes a python dictionary and assigns all present key value pairs to 
        the attributes of this SQLALchemy model (self). If the value type is a dict, update 
        the related model using the value as the new starting point for that model. IF the 
        value type is a list, use the relationship (of the same name) to update the related 
        objects, matching on the destination model's set of primary key, if there isn't an 
        existing item, create a new object using Marshmallow.ModelSchema.load() 
        
        Handle types, UUID doesn't implement python_type, and datetime columns needs special handling.

        Parameters: data_dict <dict>
        Return: None
        Side-Effect: Self attributes have been overwritten by values in data_dict, matched on key, recursivly.
        """

        current_app.logger.debug(depth * '-' + f'updating{self}')
        model = inspect(self.__class__)
        editable_columns = [
            c for c in model.columns if c.name not in [pk.name for pk in model.primary_key]
        ]
        assert isinstance(data_dict, dict)
        for k, v in data_dict.items():
            current_app.logger.debug(depth * '>' + f'{type(v)}-{k}')
            if isinstance(v, dict):
                current_app.logger.debug(depth * ' ' + f'recursivly updating {k}')
                getattr(self, k).deep_update_from_dict(v, depth=(depth + 1))

            if isinstance(v, list):
                obj_list = getattr(self, k)
                current_app.logger.debug(depth * ' ' + f'updating child list = {obj_list}')
                for i in v:
                    current_app.logger.debug(depth * ' ' + str(i))
                    #get list of pk column names for child class
                    pk_names = [pk.name for pk in inspect(obj_list[0].__class__).primary_key]
                    #ASSUMPTION: lists of object, never lists of anything else.

                    #see if object list holds a child that has the same values as the json dict for all primary key values of class
                    existing_obj = next((x for x in obj_list if all(
                        i.get(pk_name, None) == getattr(x, pk_name) for pk_name in pk_names)), None)
                    #ALWAYS NONE for new obj, except tests
                    if existing_obj:
                        current_app.logger.debug(
                            depth * ' ' +
                            f'found existing{existing_obj} with pks {[(pk_name,getattr(existing_obj, pk_name)) for pk_name in pk_names]}'
                        )
                        existing_obj.deep_update_from_dict(i, depth=(depth + 1))
                    elif False:
                        #TODO check if this item is in the db, but not in json set should be removed
                        #unsure if we want this behaviour, could be done in second pass as well
                        pass
                    else:
                        #no existing obj with PK match, so create  item in related list
                        current_app.logger.debug(depth * ' ' + f'add new item to {self}.{k}')
                        rel = getattr(self.__class__, k)                               #SA.relationship definition
                        new_obj_class = rel.property.entity.class_                     #class for relationship target
                        new_obj = new_obj_class._schema().load(i)                      #marshmallow load dict -> obj
                        obj_list.append(new_obj)
                        current_app.logger.debug(f'just created and saved{new_obj}=' +
                                                 str(new_obj_class._schema().dump(new_obj)))

            if k in [c.name for c in editable_columns]:
                col = next(col for col in editable_columns if col.name == k)
                #get column definition for
                current_app.logger.debug(depth * ' ' + f'updating {self}.{k}={v}')
                if (type(col.type) == UUID):
                    #UUID does not implement python_type, manual check
                    assert isinstance(v, (UUID, str))
                else:
                    py_type = col.type.python_type
                    if py_type == datetime:
                        #json value is string, if expecting datetime in that column, convert here
                        setattr(self, k, parser.parse(v))
                        continue
                    elif not isinstance(v, py_type):
                        #type safety (don't coalese empty string to false if it's targetting a boolean column)
                        raise DictLoadingError(
                            f"cannot assign '{k}':{v}{type(v)} to column of type {py_type}")
                    else:
                        setattr(self, k, v)
        if depth == 0:
            self.save()
        return


class AuditMixin(object):
    create_user = db.Column(db.String(60), nullable=False, default=User().get_user_username)
    create_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    update_user = db.Column(
        db.String(60),
        nullable=False,
        default=User().get_user_username,
        onupdate=User().get_user_username)
    update_timestamp = db.Column(
        db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

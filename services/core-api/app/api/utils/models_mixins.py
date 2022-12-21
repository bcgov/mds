import decimal
from numbers import Number
from datetime import datetime, date
from dateutil import parser
from flask import current_app
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.types import TypeEngine
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.schema import FetchedValue
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from flask import has_request_context

from app.extensions import db
from app.api.constants import STATE_MODIFIED_DELETE_ON_PUT

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
        if has_request_context():
            user_security = auth.get_current_user_security()

            if user_security.is_restricted():
                # use reflection to get current model
                cls = mzero.class_

                # if model includes mine_guid, apply filter on mine_guid.
                mapper = inspect(cls)

                if 'mine_guid' in [c.name for c in mapper.columns] and query._user_bound:
                    query = query.enable_assertions(False).filter(
                        cls.mine_guid.in_(user_security.mine_ids))

    return query


class DictLoadingError(Exception):
    """Raised when incoming type does not match expected type, prevents coalesing"""
    pass


class Base(db.Model):
    __abstract__ = True
    _edit_groups = []
    _edit_key = None
    # Set default query_class on base class.
    query_class = UserBoundQuery

    # This allows all models access to the default Marshmallow model Schema
    # but also allows them to override it if need be.
    _ModelSchema = SQLAlchemyAutoSchema

    def save(self, commit=True):
        db.session.add(self)
        if commit:
            try:
                db.session.commit()
            except SQLAlchemyError as e:
                db.session.rollback()
                raise e

    def delete(self, commit=True):
        if hasattr(self, 'deleted_ind'):
            raise Exception("Not implemented for soft deletion.")
            ##SoftDeleteMixin.delete() should have overridden this.
        db.session.delete(self)
        current_app.logger.warn(f'Deleting object: {self}')
        if commit:
            try:
                db.session.commit()
            except SQLAlchemyError as e:
                db.session.rollback()
                raise e

    def _deep_update_from_dict(self, data_dict, depth=0, _edit_key=None):
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
        mapper = inspect(self.__class__)
        editable_columns = [
            c for c in mapper.columns if c.name not in [pk.name for pk in mapper.primary_key]
        ]
        class_relationships = mapper.relationships

        if not _edit_key:
            if not self._edit_key:
                current_app.logger.warn(
                    'Model._edit_key not set, no related models will be updated')
            _edit_key = self._edit_key

        assert isinstance(data_dict, dict)

        for k, v in data_dict.items():
            current_app.logger.debug(depth * '>' + f'{type(v)}-{k}')
            if isinstance(v, dict):
                if k not in [r for r, x in class_relationships.items()]:
                    current_app.logger.debug(f'key <{k}> is not a relationship, skipping')
                    continue
                if len(v.keys()) < 1:
                    continue
                rel = getattr(self.__class__, k)
                rel_class = rel.property.entity.class_
                if _edit_key not in rel_class._edit_groups:
                    current_app.logger.debug(
                        f'COMBOBREAKER!!! {_edit_key} not in {rel_class} edit groups {rel_class._edit_groups}'
                    )
                    continue
                current_app.logger.debug(depth * ' ' + f'recursively updating {k}')
                existing_obj = getattr(self, k)
                if existing_obj is None:
                    setattr(self, k, rel_class())
                getattr(self, k)._deep_update_from_dict(v, depth=(depth + 1), _edit_key=_edit_key)

                #if DELETE_ITEM_FROM_DICT_JSON_KEY:True in json, delete object
                if v.get('state_modified', False) == STATE_MODIFIED_DELETE_ON_PUT:
                    current_app.logger.debug(depth * ' ' + f'deleting {existing_obj}')
                    #FIXME Caller is responsible for marking all child records.
                    existing_obj.delete(commit=False)
                    current_app.logger.debug(
                        f'session objects marked as deleted: {db.session.deleted}')

            if isinstance(v, list):
                rel = getattr(self.__class__, k) #SA.relationship definition
                obj_list = getattr(self, k)
                obj_list_class = rel.property.entity.class_

                if _edit_key not in obj_list_class._edit_groups:
                    #not part of same edit group, skip
                    current_app.logger.debug(
                        f'COMBOBREAKER!!! {_edit_key} not in {obj_list_class} edit groups {obj_list_class._edit_groups}'
                    )
                    continue

                current_app.logger.debug(depth * ' ' + f'updating child list = {obj_list}')
                for i in v:
                    current_app.logger.debug(depth * ' ' + str(i))
                    #get list of pk column names for child class
                    pk_names = [pk.name for pk in inspect(obj_list_class).primary_key]
                    #ASSUMPTION: lists of object, never lists of anything else.

                    #see if object list holds a child that has the same values as the json dict for all primary key values of class
                    existing_obj = next((x for x in obj_list if all(
                        i.get(pk_name, None) == getattr(x, pk_name)
                        and getattr(x, pk_name) is not None for pk_name in pk_names)), None)

                    #ALWAYS NONE for new obj, except tests
                    if existing_obj:
                        current_app.logger.debug(
                            depth * ' ' +
                            f'found existing{existing_obj} with pks {[(pk_name,getattr(existing_obj, pk_name)) for pk_name in pk_names]}'
                        )
                        #if DELETE_ITEM_FROM_LIST_JSON_KEY:True in json, delete object
                        if i.get('state_modified', False) == STATE_MODIFIED_DELETE_ON_PUT:
                            current_app.logger.debug(depth * ' ' + f'deleting {existing_obj}')
                            #FIXME Caller is responsible for marking all child records.
                            existing_obj.delete(commit=False)
                            current_app.logger.debug(
                                f'session objects marked as deleted: {db.session.deleted}')

                        existing_obj._deep_update_from_dict(
                            i, depth=(depth + 1), _edit_key=_edit_key)

                    elif False:
                        #TODO check if this item is in the db, but not in json set should be removed
                        #unsure if we want this behaviour, could be done in second pass as well
                        pass

                    else:
                        if not hasattr(obj_list_class, '_schema'):
                            raise Exception(
                                "Marshmallow schema model._schema doesn't exist on this model ")

                        #THIS BLOCK MAKES PUT NON-IDEMPOTENT... may need to be reconsidered
                        #no existing obj with PK match, so create  item in related list
                        current_app.logger.debug(depth * ' ' + f'add new item to {self}.{k}')
                        new_obj = obj_list_class._schema().load(i)                     #marshmallow load dict -> obj
                        obj_list.append(new_obj)
                        current_app.logger.debug(f'just created and saved{new_obj}=' +
                                                 str(obj_list_class._schema().dump(new_obj)))

            if k in [c.name for c in editable_columns]:
                col = next(col for col in editable_columns if col.name == k)

                #get column definition for
                current_app.logger.debug(depth * ' ' + f'updating {self}.{k}={v}')

                if (type(col.type) == UUID):
                    #UUID does not implement python_type, manual check
                    if v is not None:
                        assert isinstance(v, (UUID, str))
                    setattr(self, k, v)
                else:
                    py_type = col.type.python_type

                    if py_type == bool and not isinstance(v, bool) and v is not None:
                        raise DictLoadingError(
                            f"cannot assign '{k}':{v}{type(v)} to column of type {py_type}")

                    if py_type == datetime or py_type == date:
                        #values that are considered null
                        if v in [None, '']:
                            setattr(self, k, None)
                        #json value is string, if expecting datetime in that column, convert here
                        else:
                            setattr(self, k, parser.parse(v))
                        continue

                    if py_type == decimal.Decimal:
                        #values that are considered null
                        if v in [None, '']:
                            setattr(self, k, None)
                        else:
                            #if Decimal column, cast whatever you get to Decimal
                            dec = decimal.Decimal(v)
                            #don't care about anything more precise, protection if incoming data is float
                            setattr(self, k, dec.quantize(decimal.Decimal('.0000001')))
                        continue

                    #for string or integer columns, consider empty strings as null
                    if py_type in (str, int) and v is '':
                        setattr(self, k, None)

                    # elif (v is not None) and not isinstance(v, py_type):
                    #     #type safety (don't coalese empty string to false if it's targetting a boolean column)
                    #     raise DictLoadingError(
                    #         f"cannot assign '{k}':{v}{type(v)} to column of type {py_type}")

                    else:
                        setattr(self, k, v)

        return

    def deep_update_from_dict(self, data_dict, _edit_key=None):
        with db.session.no_autoflush:
            self._deep_update_from_dict(data_dict, _edit_key=_edit_key)

            current_app.logger.debug('DONE UPDATING AND SAVING')
            try:
                db.session.commit()
                self.save()
            except Exception as e:
                db.session.rollback()
                raise (e)
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


class SoftDeleteMixin(object):
    deleted_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    #TODO https://blog.miguelgrinberg.com/post/implementing-the-soft-delete-pattern-with-flask-and-sqlalchemy
    #This model can choose it's query class (one that respects the deleted ind!!!)

    def delete(self, commit=True):
        if False:
            #experimental code
            #cascading smart delete (soft/hard, only on children, not parents)
            mapper = inspect(self.__class__)
            related_models = [rel.entity.class_ for rel in mapper.relationships]

            for model in related_models:
                related_mapper = inspect(model)
                if mapper.primary_key.__name__ in [
                        c.name for c in model.primary_key.columns if c.nullable == False
                ]:
                    #source object is non_nullable fk on related object
                    #cascade deleted indicator
                    related = getattr(self, model.relationship)
                    if type(related) == list:
                        [r.delete(commit=commit) for r in related]
                    else:
                        related.delete(commit=commit)

        #TODO: Handle children, or let model override this.
        self.deleted_ind = True

        if commit == True:
            self.save()

    def undelete(self, commit=True):
        self.deleted_ind = False

        if commit == True:
            self.save()

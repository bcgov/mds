from datetime import datetime
from flask import current_app
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.types import TypeEngine
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base

from app.extensions import db
from .include.user_info import User

from sqlalchemy.inspection import inspect


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
        print(f'this{self}', flush=True)
        model = inspect(self.__class__)
        editable_columns = [
            c for c in model.columns if c.name not in [pk.name for pk in model.primary_key]
        ]
        assert isinstance(data_dict, dict)
        for k, v in data_dict.items():
            print(depth * '>' + f'{type(v)}-{k}', flush=True)
            if isinstance(v, dict):
                print(depth * ' ' + f'recursivly updating {k}', flush=True)
                getattr(self, k).deep_update_from_dict(v, depth=(depth + 1))

            if isinstance(v, list):
                obj_list = getattr(self, k)
                print(depth * ' ' + f'obj_list = {obj_list}', flush=True)
                if len(obj_list) > 0:
                    for i in v:
                        #skip if db has no values
                        pk_names = [pk.name for pk in inspect(obj_list[0].__class__).primary_key]
                        print(depth * ' PKs = ' + str(pk_names), flush=True)

                        #lists of object, never lists of anything else.
                        existing_obj = next((x for x in obj_list if all(
                            i.get(pk_name, None) == getattr(x, pk_name) for pk_name in pk_names)),
                                            None)     #false always if new obj.
                        #print([(getattr(x, pk_names[0]), i[pk_names[0]]) for x in o    bj_list])
                        if existing_obj:
                            print(depth * ' ' + f'found existing{existing_obj}', flush=True)
                            existing_obj.deep_update_from_dict(i, depth=(depth + 1))
                        elif False:
                            #TODO check if this item is in sthe db, but should be removed
                            pass
                        else:
                            print(depth * ' ' + f'ADD NEW ITEM TO LIST {k}', flush=True)
                            rel = getattr(self.__class__, k)
                            new_obj_class = rel.property.entity.class_
                            schema = new_obj_class._schema()
                            #print(schema)
                            #print(schema.load_fields)
                            new_obj = schema.load(i)
                            existing_relationship = getattr(self, k)
                            existing_relationship.append(new_obj)
                            print(
                                f'just created and saved{new_obj}=' + str(schema.dump(new_obj)),
                                flush=True)

                else:
                    print(depth * ' ' + 'empty list', flush=True)
            if k in [c.name for c in editable_columns]:
                col = next(col for col in editable_columns if col.name == k)
                print(depth * ' ' + f'updating column <{k}>={v}', flush=True)
                if (type(col.type) == UUID):
                    assert isinstance(v, (UUID, str))
                else:
                    py_type = col.type.python_type
                    if py_type == datetime:
                        setattr(self, k, datetime.strptime(v, '%Y-%m-%d'))
                        continue
                    elif not isinstance(v, py_type):
                        raise DictLoadingError(
                            f"cannot assign '{k}':{v}{type(v)} to column of type {py_type}")
                    else:
                        setattr(self, k, v)
        print(f'saving and returning from updating {self}', flush=True)
        self.save()
        return self


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

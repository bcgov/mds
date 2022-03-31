from flask_sqlalchemy import BaseQuery
from app.extensions import db


class QueryWithSoftDelete(BaseQuery):

    def __new__(cls, *args, **kwargs):
        obj = super(QueryWithSoftDelete, cls).__new__(cls)
        with_deleted = kwargs.pop('_with_deleted', False)
        if len(args) > 0:
            super(QueryWithSoftDelete, obj).__init__(*args, **kwargs)
            return obj.filter_by(deleted_ind=False) if not with_deleted else obj
        return obj

    def __init__(self, *args, **kwargs):
        pass

    def with_deleted(self):
        return self.__class__(
            db.class_mapper(self._entity_from_pre_ent_zero().class_),
            session=db.session(),
            _with_deleted=True)

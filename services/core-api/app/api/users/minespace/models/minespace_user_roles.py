from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class MinespaceUserRole(AuditMixin, Base):
    __tablename__ = 'minespace_user_role'

    minespace_user_role_code = db.Column(db.String(3), primary_key=True)
    description = db.Column(db.String(100), nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    @classmethod
    def get_all(cls):
        return cls.query.filter_by(active_ind=True).all()

    @classmethod
    def find_by_code(cls, code):
        return cls.query.filter_by(minespace_user_role_code=code).filter_by(active_ind=True).first()

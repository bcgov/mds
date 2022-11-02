from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base
from sqlalchemy.schema import FetchedValue


class SubDivisionCode(AuditMixin, Base):
    __tablename__ = 'sub_division_code'
    sub_division_code = db.Column(db.String, nullable=False, primary_key=True)
    description = db.Column(db.String, nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    address_type_code = db.Column(db.String, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<SubDivisionCode %r>' % self.sub_division_code

    @classmethod
    def get_all(cls):
        return cls.query.all()

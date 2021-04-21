from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db


class GovernmentAgencyType(AuditMixin, Base):
    __tablename__ = 'government_agency_type'
    government_agency_type_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.government_agency_type_code}>'

    @classmethod
    def get_all(cls):
        return cls.query.all()
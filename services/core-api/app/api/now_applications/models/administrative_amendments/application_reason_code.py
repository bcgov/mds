from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import Base
from app.extensions import db


class ApplicationReasonCode(Base):
    __tablename__ = 'application_reason_code'
    application_reason_code = db.Column(db.String(3), primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.application_reason_code}>'

    @classmethod
    def get_all(cls):
        return cls.query.filter_by(active_ind=True).all()
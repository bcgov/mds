from flask import current_app
from sqlalchemy import FetchedValue
from sqlalchemy.dialects.postgresql import UUID

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db


class Municipality(AuditMixin, Base):
    __tablename__ = "municipality"

    municipality_guid = db.Column(UUID(as_uuid=True), nullable=False, server_default=FetchedValue(), primary_key=True)
    municipality_name = db.Column(db.String(), nullable=False)

    @classmethod
    def get_all(cls):
        return cls.query.all()

    @classmethod
    def find_by_guid(cls, municipality_guid):
        current_app.logger.debug(f"Looking for municipality with {municipality_guid}")
        return cls.query.filter_by(municipality_guid=municipality_guid).first()

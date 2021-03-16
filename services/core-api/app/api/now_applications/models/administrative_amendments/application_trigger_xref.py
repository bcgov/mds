from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID

from app.extensions import db
from app.api.utils.models_mixins import Base


class ApplicationTriggerXref(Base):
    __tablename__ = "application_trigger_xref"

    now_application_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('now_application_identity.now_application_guid'),
        primary_key=True)
    application_trigger_type_code = db.Column(
        db.String(3),
        db.ForeignKey('application_trigger_type_code.application_trigger_type_code'),
        primary_key=True)

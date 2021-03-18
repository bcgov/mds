from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID

from app.extensions import db
from app.api.utils.models_mixins import Base


class AmendmentReasonXref(Base):
    __tablename__ = "amendment_reason_xref"

    now_application_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('now_application_identity.now_application_guid'),
        primary_key=True)
    amendment_reason_code = db.Column(
        db.String(3),
        db.ForeignKey('amendment_reason_code.amendment_reason_code'),
        primary_key=True)

from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID

from app.extensions import db
from app.api.utils.models_mixins import Base
from app.api.constants import NOW_APPLICATION_EDIT_GROUP


class ApplicationReasonXref(Base):
    __tablename__ = "application_reason_code_xref"

    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]
    _edit_key = NOW_APPLICATION_EDIT_GROUP

    now_application_id = db.Column(
        db.Integer, db.ForeignKey('now_application.now_application_id'), primary_key=True)
    application_reason_code = db.Column(
        db.String(3),
        db.ForeignKey('application_reason_code.application_reason_code'),
        primary_key=True)

    def __repr__(self):
        return f'<ApplicationReasonXref now_application_id={self.now_application_id}, application_reason_code={self.application_reason_code}>'
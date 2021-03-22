from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID

from app.extensions import db
from app.api.utils.models_mixins import Base
from app.api.constants import NOW_APPLICATION_EDIT_GROUP


class AmendmentReasonXref(Base):
    __tablename__ = "amendment_reason_code_xref"

    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]
    _edit_key = NOW_APPLICATION_EDIT_GROUP

    now_application_id = db.Column(
        db.Integer, db.ForeignKey('now_application.now_application_id'), primary_key=True)
    amendment_reason_code = db.Column(
        db.String(3),
        db.ForeignKey('amendment_reason_code.amendment_reason_code'),
        primary_key=True)

    def __repr__(self):
        return f'<AmendmentReasonXref now_application_id={self.now_application_id}, amendment_reason_code={self.amendment_reason_code}>'
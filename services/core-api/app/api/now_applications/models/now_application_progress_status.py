from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class NOWApplicationProgressStatus(AuditMixin, Base):
    __tablename__ = 'now_application_progress_status'
    application_progress_status_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    display_order = db.Column(db.Integer)

    @classmethod
    def get_all(cls):
        return cls.query.all()
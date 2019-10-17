from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db


class ActivitySummaryType(Base, AuditMixin):
    __tablename__ = "activity_summary_type"

    activity_summary_type_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<ActivitySummaryType %r>' % self.activity_summary_type_code
import uuid
from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base
from ....documents.variances.models.variance import VarianceDocument


class VarianceApplicationStatusCode(AuditMixin, Base):
    __tablename__ = "variance_application_status_code"
    variance_application_status_code = db.Column(db.String, primary_key=True, nullable=False)
    description = db.Column(db.String, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<VarianceApplicationStatusCode %r>' % self.variance_application_status_code

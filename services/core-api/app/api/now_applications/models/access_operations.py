from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db

from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase
from app.api.constants import *


class AccessOperations(ActivitySummaryBase):
    id = "access_operations"

    def __repr__(self):
        return '<AccessOperations %r>' % self.id
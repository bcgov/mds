from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from .activity_summary_base import ActivitySummaryBase


class MechanicalTrenching(ActivitySummaryBase):
    __mapper_args__ = {
        'polymorphic_identity': '',  ## type code
    }

    ## NO TABLE FOR THIS TYPE

    def __repr__(self):
        return '<MechanicalTrenching %r>' % self.activity_id

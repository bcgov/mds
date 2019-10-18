from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from .activity_summary_base import ActivitySummaryBase


class ExplorationAccess(ActivitySummaryBase):
    __mapper_args__ = {
        'polymorphic_identity': "ea",  ## type code
    }

    ## NO TABLE FOR THIS TYPE

    def __repr__(self):
        return '<ExplorationAccess %r>' % self.activity_id

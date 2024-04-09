from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_applications.models.activity_summary.activity_summary_base import ActivitySummaryBase


class WaterSupply(ActivitySummaryBase):
    __mapper_args__ = {
        'polymorphic_identity': 'water_supply',  ## type code
    }

    ## NO TABLE FOR THIS TYPE
    details = db.relationship('WaterSupplyDetail', secondary='activity_summary_detail_xref', overlaps='detail,detail_associations,summary,summary_associations')

    def __repr__(self):
        return '<WaterSupply %r>' % self.activity_summary_id
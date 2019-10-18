    from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from .activity_summary_base import ActivitySummaryBase

class SettlingPond(ActivitySummaryBase):
    __tablename__ = "settling_pond"
    __mapper_args__ = {
        'polymorphic_identity': '',  ## type code
    }
    activity_summary_id = db.Column(db.Integer, db.ForeignKey('activity_summary.activity_summary_id'), primary_key=True)

    proponent_pond_name = db.Column(db.String)
    water_source_description = db.Column(db.String)
    is_ponds_exfiltared = db.Column(db.Boolean, nullable=False, default=False)
    is_ponds_recycled = db.Column(db.Boolean, nullable=False, default=False)
    is_ponds_discharged = db.Column(db.Boolean, nullable=False, default=False)

    def __repr__(self):
        return '<SettlingPond %r>' % self.activity_id

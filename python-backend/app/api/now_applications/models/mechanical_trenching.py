from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from .activity import Activity


class MechanicalTrenching(Activity):
    __mapper_args__ = {
        'polymorphic_identity': '',  ## type code
    }

    def __repr__(self):
        return '<MechanicalTrenching %r>' % self.activity_id

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from .activity import Activity


class ExplorationSurfaceDrilling(Activity):
    __tablename__ = "exploration_surface_drilling"
    __mapper_args__ = {
        'polymorphic_identity': '',
    }
    activity_id = db.Column(db.Integer, db.ForeignKey('activity.activity_id'), primary_key=True)

    reclamation_core_storage = db.Column(db.String)

    def __repr__(self):
        return '<ExplorationSurfaceDrilling %r>' % self.activity_id

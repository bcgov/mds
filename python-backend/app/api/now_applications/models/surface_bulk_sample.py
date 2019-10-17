import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from .activity import Activity


class SurfaceBulkSample(Activity):
    __tablename__ = 'surface_bulk_sample'
    __mapper_args__ = {
        'polymorphic_identity': 'surface_bulk_surface',
    }
    activity_id = db.Column(db.Integer, db.ForeignKey('activity.activity_id'), primary_key=True)

    processing_method_description = db.Column(db.String, nullable=False)
    handling_instructions = db.Column(db.String)
    drainage_mitigation_description = db.Column(db.String)

    def __repr__(self):
        return '<SurfaceBulkSurface %r>' % self.activity_id
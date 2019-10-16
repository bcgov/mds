import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class SurfaceBulkSurface(AuditMixin, Base):
    __tablename__ = 'surface_bulk_surface'

    surface_bulk_sample_id = db.Column(db.Integer, primary_key=True)
    now_application_id = db.Column(db.Integer,
                                   db.ForeignKey('now_application.now_application_id'),
                                   nullable=False)
    processing_method_description = db.Column(db.String, nullable=False)
    handling_instructions = db.Column(db.String)
    reclamation_description = db.Column(db.String)
    drainage_mitigation_description = db.Column(db.String)
    reclamation_cost = db.Column(db.Numeric(10, 2))
    total_disturbed_area = db.Column(db.Numeric(14, 2))
    total_disturbed_area_unit_type_code = db.Column(db.String,
                                                    db.ForeignKey('unit_type.unit_type_code'))

    now_application = db.relationship('NOWApplication', lazy='select')
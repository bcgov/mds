import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class PlacerOperation(AuditMixin, Base):
    __tablename__ = 'placer_operation'
    placer_operation_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    is_underground = db.Column(db.Boolean, nullable=False)
    is_hand_operation = db.Column(db.Boolean, nullable=False)
    reclamation_area = db.Column((db.Numeric(14, 2)))
    reclamation_unit_type_code = db.Column(db.String,
                                           db.ForeignKey('unit_type.unit_type_code'),
                                           nullable=False)
    reclamation_cost = db.Column((db.Numeric(10, 2)))
    reclamation_description = db.Column(db.String)
    total_disturbed_area = db.Column(db.Numeric(14, 2))
    total_disturbed_area_unit_type_code = db.Column(db.String,
                                                    db.ForeignKey('unit_type.unit_type_code'),
                                                    nullable=False)

    now_applications = db.relationship('NOWApplication',
                                       lazy='joined',
                                       secondary='now_application_placer_xref')

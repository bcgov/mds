import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class NOWApplicationPlacerXref(AuditMixin, Base):
    __tablename__ = 'now_application_placer_xref'
    now_application_id = db.Column(db.Integer,
                                   db.ForeignKey('placer_operation.placer_operation_id'),
                                   nullable=False)
    placer_operation_id = db.Column(db.Integer,
                                    db.ForeignKey('placer_operation.placer_operation_id'),
                                    nullable=False)
    is_existing_placer_activity = db.Column(db.Boolean, nullable=False)

    now_application = db.relationship('NOWApplication', backref='Placer_xrefs')
    placer_operation = db.relationship('PlacerOperation', backref='NOW_xrefs')

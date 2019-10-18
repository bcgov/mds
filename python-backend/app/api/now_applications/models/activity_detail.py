import uuid, datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class ActivityDetail(AuditMixin, Base):
    __tablename__ = 'activity_detail'
    activity_detail_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    activity_id = db.Column(db.Integer, db.ForeignKey('activity_summary.activity_summary_id'))
    activity_description = db.Column(db.String)
    disturbed_area = db.Column(db.Numeric(14, 2))
    timber_volume = db.Column(db.Numeric(14, 2))
    number_of_sites = db.Column(db.Integer)
    width = db.Column(db.Integer)
    length = db.Column(db.Integer)
    depth = db.Column(db.Integer)
    quantity = db.Column(db.Integer)
    incline = db.Column(db.Numeric(14, 2))
    incline_unit_type_code = db.Column(db.String, db.ForeignKey('unit_type.unit_type_code'))
    cut_line_length = db.Column(db.Integer)
    water_quantity = db.Column(db.Integer)
    water_quantity_unit_type_code = db.Column(db.String, db.ForeignKey('unit_type.unit_type_code'))

    activity_summary = db.relationship('ActivitySummaryBase')

    def __repr__(self):
        return '<ActivityDetail %r>' % self.activity_detail_id

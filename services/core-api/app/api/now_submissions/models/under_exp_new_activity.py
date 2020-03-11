from marshmallow import fields, validate
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import Base
from app.extensions import db
from app.api.constants import unit_type_map


class UnderExpNewActivity(Base):
    __tablename__ = "under_exp_new_activity"
    __table_args__ = {"schema": "now_submissions"}

    class _ModelSchema(Base._ModelSchema):
        id = fields.Integer(dump_only=True)
        inclineunits = fields.String(validate=validate.OneOf(choices=unit_type_map.keys()))

    id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    messageid = db.Column(db.Integer, db.ForeignKey('now_submissions.application.messageid'))
    type = db.Column(db.String)
    incline = db.Column(db.Numeric(14, 1))
    inclineunits = db.Column(db.String)
    quantity = db.Column(db.Integer)
    length = db.Column(db.Numeric(14, 1))
    width = db.Column(db.Numeric(14, 1))
    height = db.Column(db.Numeric(14, 1))
    seq_no = db.Column(db.Integer)

    def __repr__(self):
        return '<UnderExpNewActivity %r>' % self.id

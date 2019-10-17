from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db

from .activity import Activity


class Camp(Activity):
    __tablename__ = "camp"
    __mapper_args__ = {
        'polymorphic_identity': '',  ## type code
    }
    activity_id = db.Column(db.Integer, db.ForeignKey('activity.activity_id'), primary_key=True)

    camp_name = db.Column(db.String)
    camp_number_people = db.Column(db.String)
    camp_number_structures = db.Column(db.String)
    has_fuel_stored = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    has_fuel_stored_in_bulk = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    has_fuel_stored_in_barrels = db.Column(db.Boolean,
                                           nullable=False,
                                           server_default=FetchedValue())
    volume_fuel_stored = db.Column(db.Integer)

    def __repr__(self):
        return '<Camp %r>' % self.activity_id

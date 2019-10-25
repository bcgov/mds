from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db


class StateOfLand(Base):
    __tablename__ = "state_of_land"

    state_of_land_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    now_application_id = db.Column(db.Integer, db.ForeignKey('now_application.now_application_id'))
    has_community_water_shed = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    has_archaeology_sites_affected = db.Column(
        db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<StateOfLand %r>' % self.state_of_land_id

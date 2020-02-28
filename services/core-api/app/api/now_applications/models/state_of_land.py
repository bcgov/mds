from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db
from app.api.constants import *


class StateOfLand(Base):
    __tablename__ = "state_of_land"
    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]

    now_application_id = db.Column(
        db.Integer, db.ForeignKey('now_application.now_application_id'), primary_key=True)
    now_application = db.relationship('NOWApplication')

    has_community_water_shed = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    has_archaeology_sites_affected = db.Column(
        db.Boolean, nullable=False, server_default=FetchedValue())

    present_land_condition_description = db.Column(db.String)
    means_of_access_description = db.Column(db.String)
    physiography_description = db.Column(db.String)
    old_equipment_description = db.Column(db.String)
    type_of_vegetation_description = db.Column(db.String)
    recreational_trail_use_description = db.Column(db.String)
    arch_site_protection_plan = db.Column(db.String)
    fn_engagement_activities = db.Column(db.String)
    cultural_heritage_description = db.Column(db.String)

    has_shared_info_with_fn = db.Column(db.Boolean, nullable=True)
    has_fn_cultural_heritage_sites_in_area = db.Column(db.Boolean, nullable=True)
    has_activity_in_park = db.Column(db.Boolean, nullable=True)
    is_on_private_land = db.Column(db.Boolean, nullable=True)
    has_auth_lieutenant_gov_council = db.Column(db.Boolean, nullable=True)

    def __repr__(self):
        return '<StateOfLand %r>' % self.now_application_id

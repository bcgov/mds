import uuid
import utm
from flask import current_app

from sqlalchemy.orm import validates, reconstructor, load_only
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property
from geoalchemy2 import Geometry
from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base
from app.api.mines.permits.permit.models.permit import Permit
from app.api.users.minespace.models.minespace_user_mine import MinespaceUserMine
from app.api.constants import *

# NOTE: Be careful about relationships defined in the mine model. lazy='joined' will cause the relationship
# to be joined and loaded immediately, so that data will load even when it may not be needed. Setting
# lazy='select' will lazy load that data when the property is first accessed. There are other options as well
# that may be best in different situations: https://docs.sqlalchemy.org/en/latest/orm/loading_relationships.html


class Mine(AuditMixin, Base):
    __tablename__ = 'mine'
    _edit_key = MINE_EDIT_GROUP

    mine_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_no = db.Column(db.String(10))
    mine_name = db.Column(db.String(60), nullable=False)
    mine_note = db.Column(db.String(300), default='')
    legacy_mms_mine_status = db.Column(db.String(50))
    major_mine_ind = db.Column(db.Boolean, nullable=False, default=False)
    deleted_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    mine_region = db.Column(db.String(2), db.ForeignKey('mine_region_code.mine_region_code'))
    ohsc_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    union_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    latitude = db.Column(db.Numeric(9, 7))
    longitude = db.Column(db.Numeric(11, 7))
    geom = db.Column(Geometry('POINT', 3005))
    mine_location_description = db.Column(db.String)
    exemption_fee_status_code = db.Column(
        db.String, db.ForeignKey('exemption_fee_status.exemption_fee_status_code'))
    exemption_fee_status_note = db.Column(db.String)

    # Relationships
    #Almost always used and 1:1, so these are joined
    mine_status = db.relationship(
        'MineStatus', backref='mine', order_by='desc(MineStatus.update_timestamp)', lazy='joined')
    mine_tailings_storage_facilities = db.relationship(
        'MineTailingsStorageFacility',
        backref='mine',
        order_by='desc(MineTailingsStorageFacility.mine_tailings_storage_facility_name)',
        lazy='joined')

    #Almost always used, but faster to use selectin to load related data
    mine_permit = db.relationship(
        'Permit', backref='mine', order_by='desc(Permit.create_timestamp)', lazy='selectin')

    mine_type = db.relationship(
        'MineType',
        backref='mine',
        order_by='desc(MineType.update_timestamp)',
        primaryjoin="and_(MineType.mine_guid == Mine.mine_guid, MineType.active_ind==True)",
        lazy='selectin')

    mine_documents = db.relationship(
        'MineDocument',
        backref='mine',
        primaryjoin=
        "and_(MineDocument.mine_guid == Mine.mine_guid, MineDocument.deleted_ind==False)",
        lazy='select')

    mine_party_appt = db.relationship('MinePartyAppointment', backref="mine", lazy='select')
    mine_incidents = db.relationship('MineIncident', backref="mine", lazy='select')
    mine_reports = db.relationship('MineReport', lazy='select')

    comments = db.relationship(
        'MineComment',
        order_by='MineComment.comment_datetime',
        primaryjoin="and_(MineComment.mine_guid == Mine.mine_guid, MineComment.deleted_ind==False)",
        lazy='joined')

    region = db.relationship('MineRegionCode', lazy='select')

    def __repr__(self):
        return '<Mine %r>' % self.mine_guid

    @reconstructor
    def init_on_load(self):
        if self.latitude and self.longitude:
            try:
                self.utm_values = utm.from_latlon(self.latitude, self.longitude)
            except utm.error.OutOfRangeError:
                self.utm_values = ()

    @hybrid_property
    def utm_easting(self):
        return self.utm_values[0] if self.utm_values else None

    @hybrid_property
    def utm_northing(self):
        return self.utm_values[1] if self.utm_values else None

    @hybrid_property
    def utm_zone_number(self):
        return self.utm_values[2] if self.utm_values else None

    @hybrid_property
    def utm_zone_letter(self):
        return self.utm_values[3] if self.utm_values else None

    @hybrid_property
    def mine_location(self):
        return {
            'latitude': self.latitude,
            'longitude': self.longitude,
            'utm_easting': self.utm_easting,
            'utm_northing': self.utm_northing,
            'utm_zone_number': self.utm_zone_number,
            'utm_zone_letter': self.utm_zone_letter,
            'mine_location_description': self.mine_location_description
        }

    @hybrid_property
    def mine_permit_numbers(self):
        rows = db.session.query(
            Permit.permit_no).filter(Permit.mine_guid == self.mine_guid).distinct().all()
        p_numbers = [permit_no for permit_no, in rows]
        return p_numbers

    @hybrid_property
    def has_minespace_users(self):
        count = db.session.query(MinespaceUserMine).filter(
            MinespaceUserMine.mine_guid == self.mine_guid).count()
        return count > 0

    @classmethod
    def find_by_mine_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(mine_guid=_id).filter_by(deleted_ind=False).first()
        except ValueError:
            return None

    @classmethod
    def find_by_mine_no(cls, _id):
        return cls.query.filter_by(mine_no=_id).filter_by(deleted_ind=False).first()

    @classmethod
    def find_by_mine_name(cls, term=None, major=None):
        MINE_LIST_RESULT_LIMIT = 50
        if term:
            name_filter = Mine.mine_name.ilike('%{}%'.format(term))
            mines_q = Mine.query.filter(name_filter).filter_by(deleted_ind=False)
        else:
            mines_q = Mine.query

        if major is not None:
            mines_q = mines_q.filter_by(major_mine_ind=major)
        return mines_q.limit(MINE_LIST_RESULT_LIMIT).all()

    @classmethod
    def find_by_name_no_permit(cls, term=None, major=None):
        MINE_LIST_RESULT_LIMIT = 50
        if term:
            name_filter = Mine.mine_name.ilike('%{}%'.format(term))
            number_filter = Mine.mine_no.ilike('%{}%'.format(term))
            permit_filter = Permit.permit_no.ilike('%{}%'.format(term))
            mines_q = Mine.query.filter(name_filter | number_filter).filter_by(deleted_ind=False)
            permit_q = Mine.query.join(Permit).filter(permit_filter)
            mines_q = mines_q.union(permit_q)
        else:
            mines_q = Mine.query

        if major is not None:
            mines_q = mines_q.filter_by(major_mine_ind=major)

        return mines_q.limit(MINE_LIST_RESULT_LIMIT).all()

    @classmethod
    def find_all_major_mines(cls):
        return cls.query.filter_by(major_mine_ind=True).filter_by(deleted_ind=False).all()

    @classmethod
    def find_by_mine_no_or_guid(cls, _id):
        result = cls.find_by_mine_guid(_id)
        if result is None:
            result = cls.find_by_mine_no(_id)

        return result

    @validates('mine_name')
    def validate_mine_name(self, key, mine_name):
        if not mine_name:
            raise AssertionError('No mine name provided.')
        if len(mine_name) > 60:
            raise AssertionError('Mine name must not exceed 60 characters.')
        return mine_name

    @validates('mine_note')
    def validate_mine_note(self, key, mine_note):
        mine_note = mine_note if mine_note else ''
        if len(mine_note) > 300:
            raise AssertionError('Mine note must not exceed 300 characters.')
        return mine_note

    @validates('mine_no')
    def validate_mine_no(self, key, mine_no):
        mine_no = mine_no if mine_no else ''
        if mine_no and len(mine_no) > 10:
            raise AssertionError('Mine number must not exceed 10 characters.')
        return mine_no

    @validates('mine_region')
    def validate_mine_region(self, key, mine_region):
        if not mine_region:
            raise AssertionError('No mine region code provided.')
        if len(mine_region) > 2:
            raise AssertionError('Invalid region code')
        return mine_region

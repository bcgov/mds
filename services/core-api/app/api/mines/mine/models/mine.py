import uuid
from datetime import datetime, timezone

import utm
from geoalchemy2 import Geometry
from sqlalchemy import func, literal, select, desc, and_
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates, reconstructor
from sqlalchemy.schema import FetchedValue

from app.api.constants import *
from app.api.mines.permits.permit.models.mine_permit_xref import MinePermitXref
from app.api.mines.permits.permit.models.permit import Permit
from app.api.mines.work_information.models.mine_work_information import MineWorkInformation
from app.api.users.minespace.models.minespace_user_mine import MinespaceUserMine
from app.api.utils.access_decorators import is_minespace_user
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.extensions import db


# NOTE: Be careful about relationships defined in the mine model. lazy='joined' will cause the relationship
# to be joined and loaded immediately, so that data will load even when it may not be needed. Setting
# lazy='select' will lazy load that data when the property is first accessed. There are other options as well
# that may be best in different situations: https://docs.sqlalchemy.org/en/latest/orm/loading_relationships.html


class Mine(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'mine'
    _edit_key = MINE_EDIT_GROUP

    mine_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_no = db.Column(db.String(10))
    mine_name = db.Column(db.String(60), nullable=False)
    mine_note = db.Column(db.String(300), default='')
    legacy_mms_mine_status = db.Column(db.String(50))
    major_mine_ind = db.Column(db.Boolean, nullable=False, default=False)
    mine_region = db.Column(db.String(2), db.ForeignKey('mine_region_code.mine_region_code'))
    ohsc_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    union_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    latitude = db.Column(db.Numeric(9, 7))
    longitude = db.Column(db.Numeric(11, 7))
    number_of_contractors = db.Column(db.Integer)
    number_of_mine_employees = db.Column(db.Integer)
    geom = db.Column(Geometry('POINT', 3005))
    mine_location_description = db.Column(db.String)
    exemption_fee_status_code = db.Column(
        db.String, db.ForeignKey('exemption_fee_status.exemption_fee_status_code'))
    exemption_fee_status_note = db.Column(db.String)
    mms_alias = db.Column(db.String)

    # Relationships
    # Almost always used and 1:1, so these are joined
    mine_status = db.relationship(
        'MineStatus', backref='mine', order_by='desc(MineStatus.update_timestamp)', lazy='joined')
    mine_tailings_storage_facilities = db.relationship(
        'MineTailingsStorageFacility',
        backref='mine',
        order_by='desc(MineTailingsStorageFacility.update_timestamp)',
        lazy='selectin')

    # Almost always used, but faster to use selectin to load related data
    _permit_identities = db.relationship(
        'Permit',
        order_by='desc(Permit.create_timestamp)',
        lazy='select',
        secondary='mine_permit_xref',
        secondaryjoin='and_(foreign(MinePermitXref.permit_id) == remote(Permit.permit_id),Permit.deleted_ind == False,MinePermitXref.deleted_ind == False)',
        back_populates='_all_mines',
        overlaps='_mine_associations,all_mine_permit_xref,mine_permit_xref,mine'
    )

    # across all permit_identities
    _mine_permit_amendments = db.relationship('PermitAmendment', lazy='selectin', back_populates='mine')

    mine_type = db.relationship(
        'MineType',
        backref='mine',
        order_by='desc(MineType.update_timestamp)',
        primaryjoin='and_(MineType.mine_guid == Mine.mine_guid, MineType.active_ind==True, MineType.now_application_guid==None)',
        lazy='selectin')

    mine_documents = db.relationship(
        'MineDocument',
        backref='mine',
        primaryjoin='and_(MineDocument.mine_guid == Mine.mine_guid, MineDocument.deleted_ind == False)',
        lazy='select')

    mine_party_appt = db.relationship('MinePartyAppointment', backref="mine", lazy='select')

    mine_incidents = db.relationship(
        'MineIncident',
        backref='mine',
        lazy='select',
        primaryjoin='and_(MineIncident.mine_guid == Mine.mine_guid, MineIncident.deleted_ind == False)')

    mine_reports = db.relationship('MineReport', lazy='select', back_populates='mine')

    explosives_permits = db.relationship(
        'ExplosivesPermit',
        backref='mine',
        lazy='select',
        primaryjoin='and_(ExplosivesPermit.mine_guid == Mine.mine_guid, ExplosivesPermit.deleted_ind == False)')

    explosives_permits_amendments = db.relationship(
        'ExplosivesPermitAmendment',
        backref='mine',
        lazy='select',
        primaryjoin='and_(ExplosivesPermitAmendment.mine_guid == Mine.mine_guid, ExplosivesPermitAmendment.deleted_ind == False)')

    projects = db.relationship(
        'Project',
        backref='mine',
        lazy='select',
        primaryjoin='and_(Project.mine_guid == Mine.mine_guid)')

    mine_work_informations = db.relationship(
        'MineWorkInformation',
        lazy='selectin',
        order_by='desc(MineWorkInformation.created_timestamp)',
        primaryjoin='and_(MineWorkInformation.mine_guid == Mine.mine_guid, MineWorkInformation.deleted_ind == False)',
        back_populates='mine'
    )

    comments = db.relationship(
        'MineComment',
        order_by='MineComment.comment_datetime',
        primaryjoin='and_(MineComment.mine_guid == Mine.mine_guid, MineComment.deleted_ind == False)',
        lazy='joined')

    alerts = db.relationship(
        'MineAlert',
        order_by='MineAlert.start_date',
        primaryjoin='and_(MineAlert.mine_guid == Mine.mine_guid, MineAlert.deleted_ind == False)'
    )

    region = db.relationship('MineRegionCode', lazy='select')

    government_agency_type_code = db.Column(
        db.String, db.ForeignKey('government_agency_type.government_agency_type_code'))

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
    def mine_manager(self):
        if self.mine_party_appt:
            today = datetime.now(timezone.utc)  # To filter out previous mine managers.
            for party in self.mine_party_appt:
                party_end_date = None
                if party.end_date:
                    party_end_date = datetime.strptime(str(party.end_date), '%Y-%m-%d').replace(tzinfo=timezone.utc)
                if party.mine_party_appt_type_code == "MMG" and party.party.email \
                    and (party_end_date == None or party_end_date > today) \
                        and str(party.status).lower() != "inactive":  #There are mine managers with null status
                    return party
        return None

    @hybrid_property
    def mine_permit(self):
        permits_w_context = []
        for p in self._permit_identities:
            p._context_mine = self
            permits_w_context.append(p)
        filtered_permits = [x for x in permits_w_context if x.permit_status_code != 'D']
        return filtered_permits

    @hybrid_property
    def mine_permit_numbers(self):
        p_numbers = [
            mpi.permit_no for mpi in self._permit_identities if mpi.permit_status_code != 'D'
        ]
        return p_numbers

    @hybrid_property
    def has_minespace_users(self):
        count = db.session.query(MinespaceUserMine).filter(
            MinespaceUserMine.mine_guid == self.mine_guid).count()
        return count > 0

    @hybrid_property
    def mine_work_information(self):
        if self.mine_work_informations:
            return self.mine_work_informations[0]
        return None

    @hybrid_property
    def work_status(self):
        if self.mine_work_informations:
            return self.mine_work_informations[0].work_status
        return "Unknown"

    @hybrid_property
    def latest_mine_status(self):
        if self.mine_status:
            latest_status = max(self.mine_status, key=lambda x: x.update_timestamp)
            return latest_status
        return None

    @work_status.expression
    def work_status(cls):
        return func.coalesce(
            select([MineWorkInformation.work_status]).where(
                and_(MineWorkInformation.mine_guid == cls.mine_guid,
                     MineWorkInformation.deleted_ind == False)).order_by(
                desc(MineWorkInformation.created_timestamp)).limit(1).as_scalar(),
            literal("Unknown"))

    @classmethod
    def find_by_mine_guid(cls, _id):
        try:
            uuid.UUID(str(_id), version=4)
            return cls.query.filter_by(mine_guid=_id).filter_by(deleted_ind=False).first()
        except (ValueError, TypeError):
            return None

    @classmethod
    def find_by_mine_no(cls, _id):
        return cls.query.filter_by(mine_no=_id).filter_by(deleted_ind=False).first()

    @classmethod
    def find_by_mine_name(cls, term=None, major=None):
        MINE_LIST_RESULT_LIMIT = None if is_minespace_user() else 50
        if term:
            name_filter = Mine.mine_name.ilike('%{}%'.format(term))
            mines_q = Mine.query.filter(name_filter).filter_by(deleted_ind=False)
        else:
            mines_q = Mine.query

        if major is not None:
            mines_q = mines_q.filter_by(major_mine_ind=major)

        response = mines_q.limit(
            MINE_LIST_RESULT_LIMIT).all() if MINE_LIST_RESULT_LIMIT else mines_q.all()

        return response

    @classmethod
    def find_by_name_no_permit(cls, term=None, major=None):
        MINE_LIST_RESULT_LIMIT = 50
        if term:
            name_filter = Mine.mine_name.ilike('%{}%'.format(term))
            number_filter = Mine.mine_no.ilike('%{}%'.format(term))
            permit_filter = Permit.permit_no.ilike('%{}%'.format(term))
            mines_q = Mine.query.filter(name_filter | number_filter).filter_by(deleted_ind=False)
            permit_q = Mine.query.join(MinePermitXref).join(Permit).filter(permit_filter)
            mines_q = mines_q.union(permit_q)
        else:
            mines_q = Mine.query

        if major is not None:
            mines_q = mines_q.filter_by(major_mine_ind=major)

        return mines_q.limit(MINE_LIST_RESULT_LIMIT).all()

    @classmethod
    def find_all_major_mines(cls):
        return cls.query.filter_by(major_mine_ind=True, deleted_ind=False).all()

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

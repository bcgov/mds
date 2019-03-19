import uuid

from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db
from ....utils.models_mixins import AuditMixin, Base
# FIXME: Model import from outside of its namespace
# This breaks micro-service architecture and is done
# for search performance until search can be refactored
from ....permits.permit.models.permit import Permit

# NOTE: Be careful about relationships defined in the mine model. lazy='joined' will cause the relationship
# to be joined and loaded immediately, so that data will load even when it may not be needed. Setting
# lazy='select' will lazy load that data when the property is first accessed. There are other options as well
# that may be best in different situations: https://docs.sqlalchemy.org/en/latest/orm/loading_relationships.html


class Mine(AuditMixin, Base):
    __tablename__ = 'mine'
    mine_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_no = db.Column(db.String(10))
    mine_name = db.Column(db.String(60), nullable=False)
    mine_note = db.Column(db.String(300), default='')
    major_mine_ind = db.Column(db.Boolean, nullable=False, default=False)
    deleted_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    mine_region = db.Column(db.String(2), db.ForeignKey('mine_region_code.mine_region_code'))
    # Relationships

    #Almost always used and 1:1, so these are joined
    mine_location = db.relationship('MineLocation', backref='mine', uselist=False, lazy='joined')
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
        'MineType', backref='mine', order_by='desc(MineType.update_timestamp)', lazy='selectin')

    #Not always desired, set to lazy load using select
    mineral_tenure_xref = db.relationship('MineralTenureXref', backref='mine', lazy='select')
    mine_expected_documents = db.relationship(
        'MineExpectedDocument',
        primaryjoin=
        "and_(MineExpectedDocument.mine_guid == Mine.mine_guid, MineExpectedDocument.active_ind==True)",
        backref='mine',
        order_by='desc(MineExpectedDocument.due_date)',
        lazy='select')
    mine_party_appt = db.relationship('MinePartyAppointment', backref="mine", lazy='select')

    def __repr__(self):
        return '<Mine %r>' % self.mine_guid

    def json(self):
        return {
            'guid':
            str(self.mine_guid),
            'mine_name':
            self.mine_name,
            'mine_no':
            self.mine_no,
            'mine_note':
            self.mine_note,
            'major_mine_ind':
            self.major_mine_ind,
            'region_code':
            self.mine_region,
            'mineral_tenure_xref': [item.json() for item in self.mineral_tenure_xref],
            'mine_location':
            self.mine_location.json() if self.mine_location else None,
            #Exploration permits must, always, and exclusively have an X as the second character, and we would like this to be returned last:
            'mine_permit': [item.json() for item in self.mine_permit if item.permit_no.lower()[1] != 'x'] + [item.json() for item in self.mine_permit if item.permit_no.lower()[1] == 'x'],
            'mine_status': [item.json() for item in self.mine_status],
            'mine_tailings_storage_facility':
            [item.json() for item in self.mine_tailings_storage_facilities],
            'mine_expected_documents': [item.json() for item in self.mine_expected_documents],
            'mine_type': [item.json() for item in self.active(self.mine_type)]
        }

    def json_for_list(self):
        return {
            'guid':
            str(self.mine_guid),
            'mine_name':
            self.mine_name,
            'mine_no':
            self.mine_no,
            'mine_note':
            self.mine_note,
            'major_mine_ind':
            self.major_mine_ind,
            'region_code':
            self.mine_region,
            'mine_permit': [item.json_for_list() for item in self.mine_permit],
            'mine_status': [item.json() for item in self.mine_status],
            'mine_tailings_storage_facility':
            [item.json() for item in self.mine_tailings_storage_facilities],
            'mine_type': [item.json() for item in self.active(self.mine_type)]
        }

    def json_for_map(self):
        return {
            'guid': str(self.mine_guid),
            'mine_name': self.mine_name,
            'mine_no': self.mine_no,
            'mine_note': self.mine_note,
            'major_mine_ind': self.major_mine_ind,
            'region_code': self.mine_region,
            'mine_location': self.mine_location.json() if self.mine_location else None
        }

    def json_by_name(self):
        return {'guid': str(self.mine_guid), 'mine_name': self.mine_name, 'mine_no': self.mine_no}

    def json_by_location(self):
        #this will get cleaned up when mine_location and mine are merged
        result = {'guid': str(self.mine_guid)}
        if self.mine_location:
            result['latitude'] = str(
                self.mine_location.latitude) if self.mine_location.latitude else ''
            result['longitude'] = str(
                self.mine_location.longitude) if self.mine_location.longitude else ''
        else:
            result['latitude'] = ''
            result['longitude'] = ''
        return result

    def json_by_permit(self):
        return {
            'guid': str(self.mine_guid),
            'mine_permit': [item.json() for item in self.mine_permit]
        }

    @staticmethod
    def active(records):
        return list(filter(lambda x: x.active_ind, records))

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
    def find_by_mine_name(cls, term=None):
        MINE_LIST_RESULT_LIMIT = 50
        if term:
            name_filter = Mine.mine_name.ilike('%{}%'.format(term))
            mines_q = Mine.query.filter(name_filter).filter_by(deleted_ind=False)
            mines = mines_q.limit(MINE_LIST_RESULT_LIMIT).all()
        else:
            mines = Mine.query.limit(MINE_LIST_RESULT_LIMIT).all()
        return mines

    @classmethod
    def find_by_name_no_permit(cls, term=None):
        MINE_LIST_RESULT_LIMIT = 50
        if term:
            name_filter = Mine.mine_name.ilike('%{}%'.format(term))
            number_filter = Mine.mine_no.ilike('%{}%'.format(term))
            permit_filter = Permit.permit_no.ilike('%{}%'.format(term))
            mines_q = Mine.query.filter(name_filter | number_filter).filter_by(deleted_ind=False)
            permit_q = Mine.query.join(Permit).filter(permit_filter)
            mines = mines_q.union(permit_q).limit(MINE_LIST_RESULT_LIMIT).all()
        else:
            mines = Mine.query.limit(MINE_LIST_RESULT_LIMIT).all()
        return mines

    @classmethod
    def find_all_major_mines(cls):
        return cls.query.filter_by(major_mine_ind=True).filter_by(deleted_ind=False).all()

    @classmethod
    def find_by_mine_no_or_guid(cls, _id):
        result = cls.find_by_mine_guid(_id)
        if result is None:
            result = cls.find_by_mine_no(_id)

        return result

    @classmethod
    def create_mine(cls, mine_no, mine_name, mine_category, mine_region, user_kwargs, save=True):
        mine = cls(
            mine_guid=uuid.uuid4(),
            mine_no=mine_no,
            mine_name=mine_name,
            major_mine_ind=mine_category,
            mine_region=mine_region,
            **user_kwargs)
        if save:
            mine.save(commit=False)
        return mine

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

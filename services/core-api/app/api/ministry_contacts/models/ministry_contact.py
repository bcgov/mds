from app.extensions import db
from sqlalchemy.dialects.postgresql import UUID
from app.api.utils.models_mixins import Base, AuditMixin
from sqlalchemy.schema import FetchedValue
from sqlalchemy import and_
from app.api.utils.models_mixins import SoftDeleteMixin


class MinistryContact(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'emli_contact'

    contact_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    contact_id = db.Column(db.Integer, nullable=False, unique=True, server_default=FetchedValue())
    emli_contact_type_code = db.Column(
        db.String(3), db.ForeignKey('emli_contact_type.emli_contact_type_code'))
    mine_region_code = db.Column(db.String(2), db.ForeignKey('mine_region_code.mine_region_code'))
    email = db.Column(db.String(254))
    phone_number = db.Column(db.String(12))
    fax_number = db.Column(db.String(12))
    mailing_address_line_1 = db.Column(db.String(254))
    mailing_address_line_2 = db.Column(db.String(254))
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    is_major_mine = db.Column(db.Boolean, nullable=False, default=False)
    is_general_contact = db.Column(db.Boolean, nullable=False, default=False)

    ministry_contact = db.relationship(
        'MinistryContactType',
        backref='emli_contact',
        order_by='asc(MinistryContactType.display_order)',
        lazy='joined')

    @classmethod
    def create(cls,
               emli_contact_type_code,
               mine_region_code,
               email,
               phone_number,
               fax_number,
               mailing_address_line_1,
               mailing_address_line_2,
               first_name,
               last_name,
               is_major_mine,
               is_general_contact,
               deleted_ind,
               add_to_session=True):
        new_contact = cls(
            emli_contact_type_code=emli_contact_type_code,
            mine_region_code=mine_region_code,
            email=email,
            phone_number=phone_number,
            fax_number=fax_number,
            mailing_address_line_1=mailing_address_line_1,
            mailing_address_line_2=mailing_address_line_2,
            first_name=first_name,
            last_name=last_name,
            is_major_mine=is_major_mine,
            is_general_contact=is_general_contact,
            deleted_ind=deleted_ind)
        if add_to_session:
            new_contact.save(commit=False)
        return new_contact

    @classmethod
    def find_ministry_contact(cls, emli_contact_type_code, mine_region_code=None, is_major_mine=None):
        if is_major_mine and mine_region_code:
            return cls.query.filter_by(
                emli_contact_type_code=emli_contact_type_code,
                mine_region_code=mine_region_code,
                is_major_mine=is_major_mine).filter_by(deleted_ind=False).first()
        elif mine_region_code:
            return cls.query.filter_by(
                emli_contact_type_code=emli_contact_type_code,
                mine_region_code=mine_region_code).filter_by(deleted_ind=False).first()
        return cls.query.filter_by(emli_contact_type_code=emli_contact_type_code).filter_by(
            deleted_ind=False).first()

    @classmethod
    def find_ministry_contact_by_guid(cls, contact_guid):
        return cls.query.filter_by(contact_guid=contact_guid).filter_by(deleted_ind=False).first()

    @classmethod
    def find_ministry_contacts_by_mine_region(cls, mine_region_code, is_major_mine=None):
        general_contacts = cls.find_ministry_general_contacts()
        mmo_contact = cls.find_major_mine_office()

        if is_major_mine == True:
            return cls.query.filter_by(
                mine_region_code=mine_region_code,
                is_major_mine=is_major_mine).filter_by(deleted_ind=False).union(mmo_contact).all()
        elif is_major_mine == False:
            return cls.query.filter_by(
                mine_region_code=mine_region_code, is_major_mine=is_major_mine).filter_by(
                    deleted_ind=False).union(general_contacts).all()

    @classmethod
    def find_ministry_general_contacts(cls):
        return cls.query.filter_by(is_general_contact=True).filter_by(deleted_ind=False)

    @classmethod
    def find_major_mine_office(cls):
        return cls.query.filter_by(
            is_major_mine=True, mine_region_code=None).filter_by(deleted_ind=False)

    @classmethod
    def get_all(cls, is_major_mine=None):
        if is_major_mine:
            return cls.query.filter_by(is_major_mine=is_major_mine).filter_by(
                deleted_ind=False).order_by(cls.mine_region_code, cls.emli_contact_type_code).all()
        return cls.query.filter_by(deleted_ind=False).order_by(cls.mine_region_code,
                                                               cls.emli_contact_type_code).all()

    def __repr__(self):
        return '<MinistryContact %r>' % self.contact_guid

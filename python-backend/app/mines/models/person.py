from datetime import datetime

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db

from .mines import MineIdentity
from .mixins import AuditMixin, Base


class Person(AuditMixin, Base):
    __tablename__ = 'person'
    person_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    first_name = db.Column(db.String(60), nullable=False)
    surname = db.Column(db.String(60), nullable=False)
    phone_no = db.Column(db.String(10), nullable=False)
    phone_ext = db.Column(db.String(4), nullable=False)
    email = db.Column(db.String(254), nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    mgr_appointment = db.relationship('MgrAppointment', order_by='desc(MgrAppointment.update_timestamp)', backref='person', lazy='joined')
    # mgr_appointment = db.relationship('MgrAppointment', backref='person', lazy='joined')

    def __repr__(self):
        return '<Person %r>' % self.person_guid

    def json(self):
        return {
            'person_guid': str(self.person_guid),
            'first_name': str(self.first_name),
            'surname': str(self.surname),
            'full_name': str(self.first_name) + ' ' + str(self.surname),
            'phone_no': str(self.phone_no),
            'phone_ext': str(self.phone_ext),
            'email': str(self.email),
            'mgr_appointment': [item.json() for item in self.mgr_appointment],
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat()
        }

    @classmethod
    def find_by_person_guid(cls, _id):
        return cls.query.filter_by(person_guid=_id).first()

    @classmethod
    def find_by_mgr_appointment(cls, _id):
        return cls.query.join(cls.mgr_appointment, aliased=True).filter_by(mgr_appointment_guid=_id).first()

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.join(cls.mgr_appointment, aliased=True).filter_by(mine_guid=_id).first()

    @classmethod
    def find_by_name(cls, first_name, surname):
        return cls.query.filter(func.lower(cls.first_name) == func.lower(first_name), func.lower(cls.surname) == func.lower(surname)).first()


class MgrAppointment(AuditMixin, Base):
    __tablename__ = "mgr_appointment"
    mgr_appointment_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    person_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('person.person_guid'), primary_key=True)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))

    def __repr__(self):
        return '<MgrAppoinment %r>' % self.mgr_appointment_guid

    def json(self):
        person = Person.find_by_person_guid(str(self.person_guid))
        mine = MineIdentity.find_by_mine_guid(str(self.mine_guid))
        mine_name = mine.mine_detail[0].mine_name
        return {
            'mgr_appointment_guid': str(self.mgr_appointment_guid),
            'mine_guid': str(self.mine_guid),
            'mine_name': str(mine_name),
            'person_guid': str(self.person_guid),
            'first_name': person.first_name,
            'surname': person.surname,
            'full_name': person.first_name + ' ' + person.surname,
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat()
        }

    @classmethod
    def find_by_mgr_appointment_guid(cls, _id):
        return cls.query.filter_by(mgr_appointment_guid=_id).first()

    @classmethod
    def find_by_person_guid(cls, _id):
        return cls.query.filter_by(person_guid=_id)

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.filter_by(mine_guid=_id)

from datetime import datetime

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID
from app.db import db
from .mixins import AuditMixin

class Person(AuditMixin, db.Model):
    __tablename__ = 'person'
    person_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    first_name = db.Column(db.String(60), nullable=False)
    surname = db.Column(db.String(60), nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    mgr_appointment = db.relationship('MgrAppointment', backref='person', lazy=True)

    def __repr__(self):
        return '<Person %r>' % self.person_guid
    
    def save(self):
        db.session.add(self)
        try:
            db.session.commit()
        except:
            db.session.rollback()

    def json(self):
        return {
            'person_guid': str(self.person_guid),
            'first_name': str(self.first_name),
            'surname': str(self.surname),
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
        return cls.query.filter(func.lower(cls.first_name)==func.lower(first_name), func.lower(cls.surname)==func.lower(surname)).first()

class MgrAppointment(AuditMixin, db.Model):
    __tablename__ = "mgr_appointment"
    mgr_appointment_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    person_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('person.person_guid'), primary_key=True)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return '<MgrAppoinment %r>' % self.mgr_appointment_guid
    
    def save(self):
        db.session.add(self)
        try:
            db.session.commit()
        except:
            db.session.rollback()

    def json(self):
        return {
            'mgr_appointment_guid': str(self.mgr_appointment_guid),
            'mine_guid': str(self.mine_guid),
            'person_guid': str(self.person_guid),
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat()
            }

    @classmethod
    def find_by_mgr_appointment_guid(cls, _id):
        return cls.query.filter_by(mgr_appointment_guid=_id).first()
    
    @classmethod
    def find_by_person_guid(cls, _id):
        return cls.query.filter_by(person_guid=_id).first()

    @classmethod
    def find_by_mine_guid(cls, _id):
        return cls.query.filter_by(mine_guid=_id).first()

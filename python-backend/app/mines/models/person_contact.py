class PersonContact(AuditMixin, Base):
    __tablename__ = "person_contact"
    person_contact_guid = db.Column(UUID(as_uuid=True), primary_key=True)
    mgr_appointment_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_manager.mgr_appointment_guid'))
    person_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('person.person_guid'), primary_key=True)
    phone_number = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(254), nullable=False)
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def __repr__(self):
        return '<MgrAppoinment %r>' % self.mgr_appointment_guid

    def json(self):
        return {
            'person_contact_guid': str(self.person_contact_guid),
            'mgr_appointment_guid': str(self.mgr_appointment_guid),
            'person_guid': str(self.person_guid),
            'phone_number': self.phone_number,
            'email': self.email,
            'effective_date': self.effective_date.isoformat(),
            'expiry_date': self.expiry_date.isoformat()
        }

    @classmethod
    def find_by_mgr_appointment_guid(cls, _id):
        return cls.query.filter_by(mgr_appointment_guid=_id).first()

    @classmethod
    def find_by_person_contact_guid(cls, _id):
        return cls.query.filter_by(person_contact_guid=_id).first()

    @classmethod
    def find_by_person_guid(cls, _id):
        return cls.query.filter_by(person_guid=_id).first()
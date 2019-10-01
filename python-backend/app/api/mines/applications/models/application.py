import uuid
from datetime import datetime
from flask_restplus import fields

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db, api

from app.api.utils.models_mixins import AuditMixin, Base


class Application(AuditMixin, Base):
    __tablename__ = 'application'
    application_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    application_guid = db.Column(UUID(as_uuid=True), nullable=False, server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), nullable=False)
    application_no = db.Column(db.String(150), nullable=False)
    application_status_code = db.Column(db.DateTime, nullable=False)
    description = db.Column(db.String)
    received_date = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        return '<Application %r>' % self.party_guid

    @classmethod
    def find_by_application_guid(cls, application_guid):
        try:
            uuid.UUID(application_guid, version=4)
            return cls.query.filter_by(application_guid=application_guid).first()
        except ValueError:
            return None

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        try:
            uuid.UUID(mine_guid, version=4)
            return cls.query.filter_by(mine_guid=mine_guid).all()
        except ValueError:
            return None

    @classmethod
    def create(cls,
               mine_guid,
               application_no,
               application_status_code,
               received_date,
               description,
               add_to_session=True):
        application = cls(mine_guid=mine_guid,
                          application_no=application_no,
                          application_status_code=application_status_code,
                          received_date=received_date,
                          description=description)
        if add_to_session:
            application.save(commit=False)
        return application

    @validates('application_status_code')
    def validate_status_code(self, key, application_status_code):
        if not application_status_code:
            raise AssertionError('Application status code is not provided.')
        return application_status_code

    @validates('application_no')
    def validate_application_no(self, key, application_no):
        if not application_no:
            raise AssertionError('Application number is not provided.')
        if len(application_no) > 16:
            raise AssertionError('Application number must not exceed 16 characters.')
        return application_no

    @validates('description')
    def validate_description(self, key, description):
        if description and len(description) > 280:
            raise AssertionError('Application description must be 280 characters or fewer.')
        return description

    @validates('received_date')
    def validate_received_date(self, key, received_date):
        if not received_date:
            raise AssertionError('Received Date is not provided.')
        return received_date
import uuid
from datetime import datetime

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from app.extensions import db

from ...utils.models_mixins import AuditMixin, Base


class Application(AuditMixin, Base):
    __tablename__ = 'applictaion'
    application_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    application_guid = db.Column(UUID(as_uuid=True), nullable=False)
    mine_guid = db.Column(UUID(as_uuid=True), nullable=False)
    application_no = db.Column(db.String(150), nullable=False)
    application_status_code = db.Column(db.DateTime, nullable=False)
    recieved_date = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return '<Application %r>' % self.party_guid

    def json(self):
        return {
            'application_id': self.application_id,
            'mine_guid': str(self.mine_guid),
            'application_guid': str(self.application_guid),
            'application_no': self.application_no,
            'application_status_code': self.application_status_code,
            'recieved_date': str(self.recieved_date),
        }

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
               recieved_date,
               description,
               user_kwargs,
               save=True):
        application = cls(
            mine_guid=mine_guid,
            application_no=application_no,
            application_status_code=application_status_code,
            recieved_date=recieved_date,
            description=description,
            **user_kwargs)
        if save:
            application.save(commit=False)
        return application
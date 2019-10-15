from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy

from app.api.utils.models_mixins import Base
from app.extensions import db


class Application(Base):
    __tablename__ = "application"

    application_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    application_guid = db.Column(UUID(as_uuid=True))
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    application_no = db.Column(db.String)
    description = db.Column(db.String)
    #application_status_code = db.Column(db.String, db.ForeignKey('application_status.application_status_code'))
    received_date = db.Column(db.DateTime)

    application_documents = db.relationship('ApplicationDocumentXref', lazy='joined')

    def __repr__(self):
        return '<Application %r>' % self.application_guid

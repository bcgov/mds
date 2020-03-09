from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from marshmallow import fields, validate

from app.api.utils.models_mixins import Base
from app.extensions import db

from app.api.now_submissions.models.client import Client
from app.api.now_submissions.models.document_nda import DocumentNDA
from app.api.utils.field_template import FieldTemplate


class ApplicationNDA(Base):
    __tablename__ = "application_nda"
    __table_args__ = {"schema": "now_submissions"}

    class _ModelSchema(Base._ModelSchema):
        application_nda_guid = fields.String(dump_only=True)
        mine_guid = fields.String(dump_only=True)
        status = FieldTemplate(field=fields.String, one_of='NOWApplicationStatus_description')

    messageid = db.Column(db.Integer, primary_key=True)
    application_nda_guid = db.Column(
        UUID(as_uuid=True), nullable=False, server_default=FetchedValue())
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))
    trackingnumber = db.Column(db.Integer)
    applicationtype = db.Column(db.String)
    status = db.Column(db.String)
    submitteddate = db.Column(db.DateTime)
    receiveddate = db.Column(db.DateTime)
    applicantclientid = db.Column(db.Integer, db.ForeignKey('now_submissions.client.clientid'))
    submitterclientid = db.Column(db.Integer, db.ForeignKey('now_submissions.client.clientid'))
    typedeemedauthorization = db.Column(db.String)
    permitnumber = db.Column(db.String)
    minenumber = db.Column(db.String)
    nownumber = db.Column(db.String)
    planactivitiesdrillprogram = db.Column(db.String)
    planactivitiesipsurvey = db.Column(db.String)
    proposedstartdate = db.Column(db.DateTime)
    proposedenddate = db.Column(db.DateTime)
    totallinekilometers = db.Column(db.Integer)
    descplannedactivities = db.Column(db.String)
    proposednewenddate = db.Column(db.DateTime)
    reasonforextension = db.Column(db.String)
    anyotherinformation = db.Column(db.String)
    vfcbcapplicationurl = db.Column(db.String)
    messagecreateddate = db.Column(db.DateTime)
    processed = db.Column(db.String)
    processeddate = db.Column(db.DateTime)
    nrsosapplicationid = db.Column(db.String)
    originating_system = db.Column(db.String)

    mine = db.relationship(
        'Mine',
        lazy='joined',
        uselist=False,
        primaryjoin='Mine.mine_guid==ApplicationNDA.mine_guid',
        foreign_keys=mine_guid)

    applicant = db.relationship(
        'Client', uselist=False, lazy='select', foreign_keys=[applicantclientid])
    submitter = db.relationship(
        'Client', uselist=False, lazy='select', foreign_keys=[submitterclientid])
    documents = db.relationship('DocumentNDA', lazy='select')

    def __repr__(self):
        return '<ApplicationNDA %r>' % self.messageid

    @classmethod
    def find_by_messageid(cls, messageid):
        return cls.query.filter_by(messageid=messageid).first()
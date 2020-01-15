from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import backref

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db
from app.api.constants import *


class NOWApplicationDocumentXref(AuditMixin, Base):
    __tablename__ = "now_application_document_xref"
    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]

    now_application_document_xref_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('mine_document.mine_document_guid'))
    now_application_id = db.Column(
        db.Integer,
        db.ForeignKey('now_application.now_application_id'),
        server_default=FetchedValue())
    now_application_document_type_code = db.Column(
        db.String,
        db.ForeignKey('now_application_document_type.now_application_document_type_code'))

    description = db.Column(db.String)
    is_final_package = db.Column(db.Boolean)

    now_application_review_id = db.Column(
        db.Integer, db.ForeignKey('now_application_review.now_application_review_id'))
    # NOWApplicationDocumentType
    now_application_document_type = db.relationship('NOWApplicationDocumentType', lazy='joined')
    now_application = db.relationship('NOWApplication', lazy='select')
    # MineDocument
    mine_document = db.relationship(
        'MineDocument',
        lazy='joined',
        backref=backref('now_application_document_xref', uselist=False))

    def __repr__(self):
        return '<ApplicationDocumentXref %r>' % self.now_application_document_xref_guid

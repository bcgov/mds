from app.api.utils.models_mixins import SoftDeleteMixin
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.orm import backref

from app.api.utils.models_mixins import AuditMixin, Base
from app.extensions import db
from app.api.constants import NOW_APPLICATION_EDIT_GROUP


class NOWApplicationDocumentXref(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'now_application_document_xref'

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
    final_package_order = db.Column(db.Integer)
    is_final_package = db.Column(db.Boolean)
    is_referral_package = db.Column(db.Boolean, server_default=FetchedValue())
    is_consultation_package = db.Column(db.Boolean, server_default=FetchedValue())

    preamble_title = db.Column(db.String)
    preamble_author = db.Column(db.String)
    preamble_date = db.Column(db.DateTime)

    now_application_review_id = db.Column(
        db.Integer, db.ForeignKey('now_application_review.now_application_review_id'))

    now_application_document_type = db.relationship('NOWApplicationDocumentType', lazy='joined')
    now_application = db.relationship('NOWApplication', lazy='select', back_populates='documents', overlaps="documents")
    now_application_document_sub_type_code = association_proxy(
        'now_application_document_type', 'now_application_document_sub_type_code')

    mine_document = db.relationship(
        'MineDocument',
        lazy='joined',
        primaryjoin='and_(MineDocument.mine_document_guid == NOWApplicationDocumentXref.mine_document_guid, MineDocument.deleted_ind==False)',
        backref=backref('now_application_document_xref', uselist=False)
    )

    def __repr__(self):
        return '<ApplicationDocumentXref %r>' % self.now_application_document_xref_guid

    @classmethod
    def find_by_guid(cls, guid):
        return cls.query.filter_by(now_application_document_xref_guid=guid).one_or_none()

    def delete(self, commit=True):
        self.mine_document.delete(commit)
        super(NOWApplicationDocumentXref, self).delete(commit)

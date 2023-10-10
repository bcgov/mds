from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import backref
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import AuditMixin, Base, SoftDeleteMixin
from app.extensions import db
from app.api.constants import NOW_APPLICATION_EDIT_GROUP
from app.api.mines.documents.models.mine_document import MineDocument


class NOWApplicationDocumentIdentityXref(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'now_application_document_identity_xref'
    _edit_groups = [NOW_APPLICATION_EDIT_GROUP]

    now_application_document_xref_guid = db.Column(
        UUID(as_uuid=True), server_default=FetchedValue())
    mine_document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('mine_document.mine_document_guid'))

    filename = db.Column(db.String, primary_key=True)
    messageid = db.Column(db.Integer, primary_key=True)
    documenturl = db.Column(db.String, primary_key=True)
    documenttype = db.Column(db.String, primary_key=True)
    description = db.Column(db.String)

    is_final_package = db.Column(db.Boolean, server_default=FetchedValue())
    final_package_order = db.Column(db.Integer)
    is_referral_package = db.Column(db.Boolean, server_default=FetchedValue())
    is_consultation_package = db.Column(db.Boolean, server_default=FetchedValue())

    preamble_title = db.Column(db.String)
    preamble_author = db.Column(db.String)
    preamble_date = db.Column(db.DateTime)

    now_application_id = db.Column(
        db.Integer,
        db.ForeignKey('now_application.now_application_id'),
        server_default=FetchedValue())

    mine_document = db.relationship(
        'MineDocument',
        lazy='joined',
        backref=backref('now_application_document_identity_xref', uselist=False))

    @hybrid_property
    def document_manager_guid(self):
        return self.mine_document.document_manager_guid

    def __repr__(self):
        return '<NOWApplicationDocumentIdentityXref %r>' % self.now_application_document_xref_guid

    @classmethod
    def find_by_guid(cls, guid):
        return cls.query.filter_by(now_application_document_xref_guid=guid).one_or_none()
    
    def delete(self, commit=True):
        self.mine_document.delete(commit)
        super(NOWApplicationDocumentIdentityXref, self).delete(commit)

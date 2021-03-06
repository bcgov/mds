from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.dialects.postgresql import UUID

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.extensions import db
from app.api.constants import PERMIT_EDIT_GROUP, PERMIT_AMENDMENT_EDIT_GROUP


class PermitAmendmentDocument(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'permit_amendment_document'

    _edit_groups = [PERMIT_EDIT_GROUP, PERMIT_AMENDMENT_EDIT_GROUP]

    permit_amendment_document_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    permit_amendment_id = db.Column(db.Integer,
                                    db.ForeignKey('permit_amendment.permit_amendment_id'))
    document_name = db.Column(db.String, nullable=False)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)
    document_manager_guid = db.Column(UUID(as_uuid=True))
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    preamble_title = db.Column(db.String)
    preamble_author = db.Column(db.String)
    preamble_date = db.Column(db.DateTime)

    permit_amendment = db.relationship(
        'PermitAmendment',
        backref='related_documents',
        lazy='joined',
        primaryjoin=
        'and_(PermitAmendment.permit_amendment_id == PermitAmendmentDocument.permit_amendment_id, PermitAmendmentDocument.deleted_ind==False)',
    )

    mine = db.relationship('Mine', lazy='select')
    mine_name = association_proxy('mine', 'mine_name')

    @classmethod
    def find_by_permit_amendment_document_guid(cls, _guid):
        return cls.query.filter_by(permit_amendment_document_guid=_guid, deleted_ind=False).first()

    @classmethod
    def find_by_permit_amendment_id(cls, id):
        return cls.query.filter_by(permit_amendment_id=id, deleted_ind=False).all()

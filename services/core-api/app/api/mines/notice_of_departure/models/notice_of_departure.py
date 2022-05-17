from enum import Enum, auto
from datetime import datetime
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import lazyload
from app.extensions import db
from app.api.constants import *
from app.api.utils.include.user_info import User


class NodType(Enum):
    non_substantial = auto()
    potentially_substantial = auto()


class NodStatus(Enum):
    pending_review = auto()
    in_review = auto()
    self_authorized = auto(),
    permit_amendment_required = auto(),
    additional_information_required = auto(),
    not_authorized = auto(),
    withdrawn = auto()


class NoticeOfDeparture(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'notice_of_departure'

    nod_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue(), primary_key=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)
    permit_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('permit.permit_guid'), nullable=False)
    nod_title = db.Column(db.String(50), nullable=False)
    nod_description = db.Column(db.String(5000), nullable=False)
    nod_type = db.Column(db.Enum(NodType), nullable=False)
    nod_status = db.Column(db.Enum(NodStatus), nullable=False)
    submission_timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    mine = db.relationship('Mine', lazy='select')
    permit = db.relationship('Permit', lazy='joined')
    documents = db.relationship(
        'NoticeOfDepartureDocumentXref',
        lazy='select',
        primaryjoin=
        "and_(NoticeOfDeparture.nod_guid==NoticeOfDepartureDocumentXref.nod_guid, NoticeOfDepartureDocumentXref.deleted_ind==False)"
    )

    mine_documents = db.relationship(
        'MineDocument',
        lazy='select',
        secondary='notice_of_departure_document_xref',
        secondaryjoin=
        'and_(foreign(NoticeOfDepartureDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid),MineDocument.deleted_ind == False)'
    )

    @classmethod
    def create(cls,
               mine,
               permit,
               nod_title,
               nod_description,
               nod_type,
               nod_status,
               add_to_session=True):
        new_nod = cls(
            permit_guid=permit.permit_guid,
            mine_guid=mine.mine_guid,
            nod_title=nod_title,
            nod_description=nod_description,
            nod_type=nod_type,
            nod_status=nod_status)

        if add_to_session:
            new_nod.save(commit=False)
        return new_nod

    @classmethod
    def find_one(cls, __guid, include_documents=False):
        if (include_documents):
            return cls.query.filter_by(
                nod_guid=__guid,
                deleted_ind=False).options(lazyload(NoticeOfDeparture.documents)).first()
        return cls.query.filter_by(nod_guid=__guid, deleted_ind=False).first()

    @classmethod
    def find_all_by_mine_guid(cls, __guid):
        return cls.query.filter_by(mine_guid=__guid, deleted_ind=False).all()

    @classmethod
    def find_all_by_permit_guid(cls, __guid, mine_guid=None):
        query = cls.query.filter_by(permit_guid=__guid, deleted_ind=False)
        if mine_guid:
            query = cls.query.filter_by(permit_guid=__guid, mine_guid=mine_guid, deleted_ind=False)
        return query.all()

    def save(self, commit=True):
        self.updated_by = User().get_user_username()
        self.updated_timestamp = datetime.utcnow()
        super(NoticeOfDeparture, self).save(commit)

    def delete(self):
        if self.mine_documents:
            for document in self.mine_documents:
                document.deleted_ind = True
        super(NoticeOfDeparture, self).delete()
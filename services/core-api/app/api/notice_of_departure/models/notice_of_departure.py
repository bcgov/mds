from enum import Enum, auto
from datetime import datetime
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import lazyload
from app.extensions import db
from app.api.constants import *
from app.api.utils.include.user_info import User
from sqlalchemy.sql import text, select, table, column, literal_column
from sqlalchemy.sql.functions import func
from sqlalchemy import desc, asc


class NodType(Enum):
    non_substantial = "non_substantial"
    potentially_substantial = "potentially_substantial"

    def __str__(self):
        return self.value


class NodStatus(Enum):
    pending_review = "pending_review"
    in_review = "in_review"
    information_required = "information_required"
    self_determined_non_substantial = "self_determined_non_substantial"
    determined_non_substantial = "determined_non_substantial"
    determined_substantial = "determined_substantial"
    withdrawn = "withdrawn"

    def __str__(self):
        return self.value


class OrderBy(Enum):
    nod_no = 'nod_no'
    nod_title = 'nod_title'
    nod_description = 'nod_description'
    nod_type = 'nod_type'
    nod_status = 'nod_status'
    update_timestamp = 'update_timestamp'

    def __str__(self):
        return self.value


class Order(Enum):
    asc = 'asc'
    desc = 'desc'

    def __str__(self):
        return self.value


class NoticeOfDeparture(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'notice_of_departure'

    nod_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue(), primary_key=True)
    nod_no = db.Column(db.String(36), nullable=False)
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
        "and_(NoticeOfDeparture.nod_guid==NoticeOfDepartureDocumentXref.nod_guid, NoticeOfDepartureDocumentXref.deleted_ind==False)",
        order_by='desc(NoticeOfDepartureDocumentXref.create_timestamp)')

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

        # generate subquery to get nod no in database layer
        nod_table = table(NoticeOfDeparture.__tablename__, column('permit_guid'))

        count_query_compiled = select([
            func.count('*')
        ]).select_from(nod_table).where(nod_table.c.permit_guid == str(permit.permit_guid)).compile(
            compile_kwargs={"literal_binds": True})

        compiled = func.to_char(text(f'({count_query_compiled}) + 1'),
                                'fm000').compile(compile_kwargs={"literal_binds": True})

        nod_no_subquery = select([literal_column(f'\'NOD-{permit.permit_no}-\' || {compiled}')])

        new_nod = cls(
            permit_guid=permit.permit_guid,
            mine_guid=mine.mine_guid,
            nod_title=nod_title,
            nod_description=nod_description,
            nod_type=nod_type,
            nod_status=nod_status,
            nod_no=nod_no_subquery)

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
    def find_all(cls,
                 mine_guid=None,
                 permit_guid=None,
                 order_by=None,
                 order=None,
                 page=None,
                 per_page=None):

        query = cls.query.filter_by(deleted_ind=False)
        if mine_guid:
            query = query.filter_by(mine_guid=mine_guid)
        if permit_guid:
            query = query.filter_by(permit_guid=permit_guid)

        if (order_by):
            if (order == 'asc'):
                query = query.order_by(cls.__dict__[order_by].asc())
            else:
                query = query.order_by(cls.__dict__[order_by].desc())

        if (page):
            result = query.paginate(page, per_page, error_out=False)
            return dict([('total', result.total), ('records', result.items)])

        result = query.all()
        return dict([('total', len(result)), ('records', result)])

    def save(self, commit=True):
        self.update_user = User().get_user_username()
        self.update_timestamp = datetime.utcnow()
        super(NoticeOfDeparture, self).save(commit)

    def delete(self):
        if self.mine_documents:
            for document in self.mine_documents:
                document.deleted_ind = True
        super(NoticeOfDeparture, self).delete()

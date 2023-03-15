from datetime import datetime
from re import sub
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import lazyload
from sqlalchemy.schema import FetchedValue
from sqlalchemy.sql import text, select, table, column, literal_column
from sqlalchemy.sql.functions import func
from app.api.services.email_service import EmailService
from app.api.constants import NOD_NOTFICATION_EMAILS
from enum import Enum
from app.api.notice_of_departure.models.notice_of_departure_contact import NoticeOfDepartureContact
from app.api.utils.include.user_info import User
from app.extensions import db
from app.config import Config


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

    def display_name(self):
        return NodStatusName[self]


NodStatusName = {
    NodStatus.pending_review: 'Pending Review',
    NodStatus.in_review: 'In Review',
    NodStatus.information_required: 'Information Required',
    NodStatus.self_determined_non_substantial: 'Self Determined Non Substantial',
    NodStatus.determined_non_substantial: 'Determined Non Substantial',
    NodStatus.determined_substantial: 'Determined Substantial',
    NodStatus.withdrawn: 'Withdrawn',
}


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

    mine = db.relationship('Mine', lazy='joined')
    permit = db.relationship('Permit', lazy='joined')
    documents = db.relationship(
        'NoticeOfDepartureDocumentXref',
        lazy='select',
        primaryjoin="and_(NoticeOfDeparture.nod_guid==NoticeOfDepartureDocumentXref.nod_guid, NoticeOfDepartureDocumentXref.deleted_ind==False)",
        order_by='desc(NoticeOfDepartureDocumentXref.create_timestamp)')

    nod_contacts = db.relationship(
        'NoticeOfDepartureContact',
        lazy='joined',
        primaryjoin="and_(NoticeOfDeparture.nod_guid==NoticeOfDepartureContact.nod_guid, NoticeOfDepartureContact.deleted_ind==False)",
    )

    primary_nod_contact = db.relationship(
        'NoticeOfDepartureContact',
        lazy='joined',
        primaryjoin="and_(NoticeOfDeparture.nod_guid==NoticeOfDepartureContact.nod_guid, NoticeOfDepartureContact.is_primary==True, NoticeOfDepartureContact.deleted_ind==False)",
    )

    mine_documents = db.relationship(
        'MineDocument',
        lazy='select',
        secondary='notice_of_departure_document_xref',
        secondaryjoin='and_(foreign(NoticeOfDepartureDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid),MineDocument.deleted_ind == False)'
    )

    @classmethod
    def create(cls,
               mine,
               permit,
               nod_title,
               nod_description,
               nod_type,
               nod_contacts,
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

        for nod_contact in nod_contacts:
            new_contact = NoticeOfDepartureContact.create(nod_guid=new_nod.nod_guid, **nod_contact)
            new_nod.nod_contacts.append(new_contact)

        if add_to_session:
            new_nod.save()

        if (new_nod.nod_type == NodType.potentially_substantial):
            new_nod.nod_submission_email()

        return new_nod

    def update(self, nod_title, nod_description, nod_type, nod_contacts, nod_status):

        self.nod_title = nod_title
        self.nod_description = nod_description
        self.nod_type = nod_type
        self.nod_status = nod_status

        # todo: optimize to not fetch the contacts before updating them
        for nod_contact in nod_contacts:
            contact = NoticeOfDepartureContact.find_one(nod_contact['nod_contact_guid'])
            contact.first_name = nod_contact['first_name']
            contact.last_name = nod_contact['last_name']
            contact.email = nod_contact['email']
            contact.phone_number = nod_contact['phone_number']
            contact.is_primary = nod_contact['is_primary']
            contact.update_user = User().get_user_username()
            contact.update_timestamp = datetime.utcnow()
            self.nod_contacts.append(contact)

        self.save()

    @classmethod
    def find_one(cls, __guid, include_documents=False, include_primary_contact_only=False):
        query = cls.query.filter_by(nod_guid=__guid)
        if (include_documents):
            query = query.options(lazyload(NoticeOfDeparture.documents))
        if (include_primary_contact_only):
            query = query.options(lazyload(NoticeOfDeparture.primary_nod_contact))
        else:
            query = query.options(lazyload(NoticeOfDeparture.nod_contacts))
        return query.first()

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

    def nod_submission_email(self):
        recipients = NOD_NOTFICATION_EMAILS

        subject = f'Notice of Departure Submitted for {self.mine.mine_name}'
        body = f'<p>{self.mine.mine_name} (Mine no: {self.mine.mine_no}) has submitted a "Notice of Departure from Approval" report.</p>'
        link = f'{Config.CORE_PRODUCTION_URL}/mine-dashboard/{self.mine.mine_guid}/permits-and-approvals/notices-of-departure'
        body += f'<p>View updates in Core: <a href="{link}" target="_blank">{link}</a></p>'
        EmailService.send_email(subject, recipients, body)

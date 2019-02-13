import json
import uuid

from datetime import datetime
from dateutil.relativedelta import relativedelta
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from app.extensions import db
from sqlalchemy.inspection import inspect
from ...required.models.required_documents import RequiredDocument

from ....utils.models_mixins import AuditMixin, Base


class ExpectedDocument(AuditMixin, Base):
    __tablename__ = 'mine_expected_document'

    exp_document_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    # Foreign Key Columns
    req_document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('mds_required_document.req_document_guid'), nullable=True)

    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'))

    exp_document_status_code = db.Column(
        db.String(3),
        db.ForeignKey('mine_expected_document_status_code.exp_document_status_code'),
        nullable=False,
        server_default=FetchedValue())
    # Data Columns
    exp_document_name = db.Column(db.String(100), nullable=False)
    exp_document_description = db.Column(db.String(300))

    due_date = db.Column(db.DateTime)
    received_date = db.Column(db.DateTime)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    #relationships
    required_document = db.relationship(
        'RequiredDocument',
        backref='exp_document_guid',
        order_by='desc(RequiredDocument.req_document_name)',
        lazy='joined')
    expected_document_status = db.relationship(
        'ExpectedDocumentStatus', backref='exp_documents', uselist=False, lazy='joined')

    def json(self):
        return {
            'exp_document_guid': str(self.exp_document_guid),
            'req_document_guid': str(self.req_document_guid),
            'mine_guid': str(self.mine_guid),
            'exp_document_name': str(self.exp_document_name),
            'exp_document_description': str(self.exp_document_description),
            'due_date': str(self.due_date),
            'received_date': str(self.received_date),
            'exp_document_status': self.expected_document_status.json()
        }

    @classmethod
    def find_by_exp_document_guid(cls, exp_document_guid):
        try:
            uuid.UUID(exp_document_guid, version=4)
            return cls.query.filter_by(active_ind=True).filter_by(
                exp_document_guid=exp_document_guid).first()
        except ValueError:
            return None

    def add_due_date_to_expected_document(self, current_date, due_date_type, period_in_months):

        current_year = current_date.year
        march = 3
        day = 31
        hour = 00
        minute = 00
        second = 00

        if due_date_type == 'FIS':

            fiscal_year_end = datetime(current_year, march, day, hour, minute, second)
            if current_date < fiscal_year_end:  #Jan - Mar
                due_date = fiscal_year_end

            else:
                due_date = fiscal_year_end + \
                    relativedelta(months=int(period_in_months))

            return due_date

        # This is only stubbed out for the future logic that will have to go here.
        elif due_date_type == 'ANV':
            return current_date

        else:
            return current_date

from datetime import datetime
import json
import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from app.extensions import db
from sqlalchemy.inspection import inspect

from ....utils.models_mixins import AuditMixin, Base


class ExpectedDocument(AuditMixin, Base):
    __tablename__ = 'mine_expected_document'

    exp_document_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    #Foreign Key Columns
    req_document_guid = db.Column(UUID(as_uuid=True), nullable=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    #Data Columns
    exp_document_name = db.Column(db.String(100), nullable=False)
    exp_document_description = db.Column(db.String(300))

    due_date = db.Column(db.DateTime) 
    received_date = db.Column(db.DateTime) 
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    exp_document_status_guid = db.Column(UUID(as_uuid=True), nullable=True)

    def json(self):
        return {
            'exp_document_guid' : str(self.exp_document_guid),
            'req_document_guid' : str(self.req_document_guid),
            'mine_guid' : str(self.mine_guid),
            'exp_document_name' : str(self.exp_document_name),
            'exp_document_description' : str(self.exp_document_description),
            'due_date' : str(self.due_date),
            'received_date' : str(self.received_date),
            'exp_document_status_guid': str(self.exp_document_status_guid),
        }

    @classmethod
    def find_by_exp_document_guid(cls, exp_document_guid):
        try:
            uuid.UUID(exp_document_guid, version=4)
            return cls.query.filter_by(active_ind=True).filter_by(exp_document_guid=exp_document_guid).first()
        except ValueError:
            return None
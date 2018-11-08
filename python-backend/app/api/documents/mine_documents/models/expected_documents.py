from datetime import datetime
import json
import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base


class MineExpectedDocument(AuditMixin, Base):
    __tablename__ = 'mine_expected_document'

    exp_document_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    #Foreign Key Columns
    req_document_guid = db.Column(UUID(as_uuid=True), nullable=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    document_fulfillment_guid  = db.Column(UUID(as_uuid=True), nullable=True)
    #Data Columns
    exp_document_name = db.Column(db.String(60), nullable=False)
    exp_document_category = db.Column(db.String(60))
    date_created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow) 
    date_received = db.Column(db.DateTime) 
    date_accepted = db.Column(db.DateTime) 
    due_date = db.Column(db.DateTime) 
    status = db.Column(db.String(60), nullable=False,  default='PENDING')
        #Audit Columns
    effective_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow) 
    expiry_date = db.Column(db.DateTime, nullable=False, default=datetime.strptime('9999-12-31', '%Y-%m-%d'))
  

    def json(self):
        return {
            'exp_document_guid' : str(self.mine_guid),
            'mine_guid' : str(self.mine_guid),
            'exp_document_name' : str(self.exp_document_name),
            'effective_date' : str(self.effective_date),
            'due_date' : str(self.due_date)
        }

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        try:
            uuid.UUID(mine_guid, version=4)
            return cls.query.filter_by(mine_guid=mine_guid).all()
        except ValueError:
            return None
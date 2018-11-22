import json
import uuid

from datetime import datetime
from dateutil.relativedelta import relativedelta
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from app.extensions import db
from sqlalchemy.inspection import inspect

from ....utils.models_mixins import AuditMixin, Base


class MineExpectedDocument(AuditMixin, Base):
    __tablename__ = 'mine_expected_document'

    exp_document_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    #Foreign Key Columns
    req_document_guid = db.Column(UUID(as_uuid=True), nullable=True)
    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine_identity.mine_guid'))
    #Data Columns
    exp_document_name = db.Column(db.String(100), nullable=False)
    exp_document_description = db.Column(db.String(300))

    due_date = db.Column(db.DateTime) 
  

    def json(self):
        return {
            'exp_document_guid' : str(self.mine_guid),
            'req_document_guid' : str(self.req_document_guid),
            'mine_guid' : str(self.mine_guid),
            'exp_document_name' : str(self.exp_document_name),
            'exp_document_description' : str(self.exp_document_description),
            'due_date' : str(self.due_date)
        }

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        try:
            uuid.UUID(mine_guid, version=4)
            return cls.query.filter_by(mine_guid=mine_guid).all()
        except ValueError:
            return None

    def add_due_date_to_expected_document(self, is_due_date_fiscal, period_in_months):
        
        current_date = datetime.now()
        current_year = current_date.year

        if is_due_date_fiscal == "True":
            march_thirty_first = datetime(current_year, 3, 31, 00, 00, 00)

            if current_date > march_thirty_first:
                due_date = march_thirty_first + relativedelta(months=int(period_in_months))

                return due_date
            
            else:
                if period_in_months > 12:
                    return (march_thirty_first + relativedelta(months=int(period_in_months - 12)))

                return march_thirty_first
        
        else:
            return current_date
            
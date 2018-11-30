from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from app.extensions import db

from ....utils.models_mixins import AuditMixin, Base

#comment to force commit
class RequiredDocumentCategory(Base):
    __tablename__ = 'mds_required_document_category'
    req_document_category_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue()) 
    req_document_category = db.Column(db.String(60))
    
    def json(self):
        return {
            'req_document_category_guid': str(self.req_document_category_guid),
            'req_document_category': str(self.req_document_category),
        }
from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from app.extensions import db

from ....utils.models_mixins import Base


class RequiredDocumentSubCategory(Base):
    __tablename__ = 'required_document_sub_category'
    req_document_sub_category_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String)

    def json(self):
        return {
            'req_document_sub_category': self.req_document_sub_category_code,
            'description': self.description,
        }
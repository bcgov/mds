from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from app.extensions import db

from app.api.utils.models_mixins import AuditMixin, Base


class RequiredDocumentCategory(Base):
    __tablename__ = 'mine_required_document_category'
    req_document_category = db.Column(db.String(3), primary_key=True)
    description = db.Column(db.String)

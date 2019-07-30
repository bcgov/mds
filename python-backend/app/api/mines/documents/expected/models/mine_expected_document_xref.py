import json
import uuid

from datetime import datetime
from dateutil.relativedelta import relativedelta
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from app.extensions import db
from sqlalchemy.inspection import inspect
from app.api.required_documents.models.required_documents import RequiredDocument

from app.api.utils.models_mixins import Base


class MineExpectedDocumentXref(Base):
    __tablename__ = 'mine_expected_document_xref'

    mine_exp_document_xref_guid = db.Column(UUID(as_uuid=True),
                                            primary_key=True,
                                            server_default=FetchedValue())
    mine_document_guid = db.Column(UUID(as_uuid=True),
                                   db.ForeignKey('mine_document.mine_document_guid'))
    exp_document_guid = db.Column(UUID(as_uuid=True),
                                  db.ForeignKey('mine_expected_document.exp_document_guid'))
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

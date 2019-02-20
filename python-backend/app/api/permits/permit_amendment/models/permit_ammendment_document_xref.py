from datetime import datetime
import uuid

from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from ....utils.models_mixins import Base
from app.extensions import db


class PermitAmendmentDocumentXref(Base):
    __tablename__ = "permit_ammendment_document_xref"
    permit_ammendment_document_xref_id = db.Column(db.Integer, primary_key=True)
    mine_document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('mine_document.mine_document_guid'))
    permit_ammendment_id = db.Column(db.Integer,
                                     db.ForeignKey('permit_amendment.permit_amendment_id'))

from datetime import datetime
import json
import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from app.extensions import db
from sqlalchemy.inspection import inspect

from app.api.utils.models_mixins import AuditMixin, Base


class ExpectedDocumentStatus(AuditMixin, Base):
    __tablename__ = 'mine_expected_document_status_code'
    exp_document_status_code = db.Column(db.String(3),
                                         primary_key=True,
                                         server_default=FetchedValue())
    description = db.Column(db.String(100), nullable=False)
    display_order = db.Column(db.Integer, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return '<ExpectedDocumentStatus %r>' % self.exp_document_status_code

    @classmethod
    def find_by_expected_document_status(cls, code):
        return cls.query.filter_by(exp_document_status_code=code).first()

    @classmethod
    def find_all_document_status(cls):
        try:
            return cls.query.filter_by(active_ind=True).all()
        except ValueError:
            return None

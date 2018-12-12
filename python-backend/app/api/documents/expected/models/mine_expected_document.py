from datetime import datetime

import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import validates
from app.extensions import db
from sqlalchemy.inspection import inspect

from ....utils.models_mixins import AuditMixin, Base
from .document import ExpectedDocument


class MineExpectedDocument(ExpectedDocument):

    mine_document = db.relationship(
        'MineDocument', secondary='mine_expected_document_xref')

    @classmethod
    def find_by_mine_guid(cls, mine_guid):
        try:
            uuid.UUID(mine_guid, version=4)
            return cls.query.filter_by(active_ind=True).filter_by(
                mine_guid=mine_guid).all()
        except ValueError:
            return None

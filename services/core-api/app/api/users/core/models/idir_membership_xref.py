import uuid
from datetime import datetime
from flask_restx import fields

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from app.extensions import db, api

from app.api.utils.models_mixins import AuditMixin, Base


class IdirMembershipXref(Base):
    __tablename__ = 'idir_membership_xref'
    core_user_id = db.Column(db.Integer, db.ForeignKey('core_user.core_user_id'), primary_key=True)
    idir_membership_id = db.Column(
        db.Integer, db.ForeignKey('idir_membership.idir_membership_id'), primary_key=True)

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.schema import FetchedValue
from sqlalchemy.orm import backref
from sqlalchemy.dialects.postgresql import UUID
from flask import current_app

from app.extensions import db

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base


class Requirements(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = "requirements"

    requirement_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    requirement_id = db.Column(
        db.Integer, server_default=FetchedValue(), nullable=False, unique=True)
    parent_requirement_id = db.Column(db.Integer, db.ForeignKey('requirements.requirement_id'))
    display_order = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(300))
    version = db.Column(db.Integer)
    all_sub_requirements = db.relationship(
        "Requirements",
        lazy='joined',
        order_by='asc(Requirements.display_order)',
        backref=backref('parent', remote_side=[requirement_id]))

    def __repr__(self):
        return f'{self.__class__.__name__} {self.requirement_id}, {self.requirement_guid}, {self.display_order}'

    def __str__(self):
        return f'{self.__class__.__name__} requirement_id: {self.requirement_id}, requirement_guid: {self.requirement_guid}, description: {self.description},  parent_requirement_id: {self.parent_requirement_id}, display_order: {self.display_order}, all_sub_requirements: {self.all_sub_requirements}'

    @hybrid_property
    def sub_requirements(self):
        return [x for x in self.all_sub_requirements if x.deleted_ind == False]

    @hybrid_property
    def step(self):
        requirement = self
        display_items = list()
        while requirement.parent_requirement_id is not None:
            display_items.append(requirement.display_order)
            requirement = requirement.parent
        display_items.append(requirement.display_order)
        display_items.reverse()

        return '.'.join(map(str, display_items)) + '.'

    @classmethod
    def find_by_requirement_guid(cls, _id):
        try:
            return cls.query.filter_by(requirement_guid=_id, deleted_ind=False).one_or_none()
        except ValueError:
            return None

    @classmethod
    def find_by_requirement_id(cls, _id):
        try:
            return cls.query.filter_by(requirement_id=_id, deleted_ind=False).one_or_none()
        except ValueError:
            return None

    @classmethod
    def get_all(cls):
        try:
            return cls.query.order_by(cls.requirement_id).filter_by(deleted_ind=False).all()
        except ValueError:
            return None

    @classmethod
    def get_all_latest_version(cls):
        max_version = db.session.query(db.func.max(cls.version)).scalar()
        try:
            return cls.query.order_by(cls.requirement_id).filter_by(deleted_ind=False, version=max_version).all()
        except ValueError:
            return None

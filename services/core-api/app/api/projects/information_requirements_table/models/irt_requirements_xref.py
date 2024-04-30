from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.extensions import db


class IRTRequirementsXref(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = "irt_requirements_xref"

    irt_requirements_xref_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    irt_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('information_requirements_table.irt_guid'))
    requirement_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('requirements.requirement_guid'))
    required = db.Column(db.Boolean, nullable=False, default=False)
    methods = db.Column(db.Boolean, nullable=False, default=False)
    comment = db.Column(db.String)

    requirement = relationship('Requirements', backref='irt_requirements_xrefs')

    @hybrid_property
    def version(self):
        return self.requirement.version

    def __repr__(self):
        return f'{self.__class__.__name__} {self.requirement_guid}'

    @classmethod
    def find_by_irt_guid(cls, _id):
        try:
            return cls.query.filter_by(irt_guid=_id, deleted_ind=False).all()
        except ValueError:
            return None

    @classmethod
    def find_by_irt_requirement_guid(cls, _irt_id, _req_id):
        try:
            return cls.query.filter_by(irt_guid=_irt_id).filter_by(
                requirement_guid=_req_id, deleted_ind=False).one_or_none()
        except ValueError:
            return None

    @classmethod
    def create(cls, irt_guid, requirement_guid, required, methods, comment, add_to_session=True):
        irt_requirements_xref = cls(
            irt_guid=irt_guid,
            requirement_guid=requirement_guid,
            required=required,
            methods=methods,
            comment=comment)

        if add_to_session:
            irt_requirements_xref.save(commit=False)

        return irt_requirements_xref

    def update(self, required, methods, comment, add_to_session=True):
        self.required = required
        self.methods = methods
        self.comment = comment

        if add_to_session:
            self.save(commit=False)

        return self

    def delete(self):
        self.deleted_ind = True
        self.save()

        return None, 204

    def __getitem__(self, item):
        return getattr(self, item)

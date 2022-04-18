from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID
from app.extensions import db
from app.api.projects.information_requirements_table.models.irt_requirements_xref import IRTRequirementsXref
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base


class InformationRequirementsTable(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = "information_requirements_table"

    irt_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    irt_id = db.Column(db.Integer, nullable=False, unique=True, server_default=FetchedValue())
    project_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('project.project_guid'), nullable=False)
    status_code = db.Column(
        db.String(3),
        db.ForeignKey('information_requirements_table_status_code.status_code'),
        nullable=False)

    project = db.relationship("Project", back_populates="information_requirements_table")
    requirements = db.relationship('IRTRequirementsXref', lazy='joined')

    def __repr__(self):
        return f'{self.__class__.__name__} {self.irt_id}, {self.irt_guid}'

    @classmethod
    def find_by_irt_guid(cls, _id):
        try:
            return cls.query.filter_by(irt_guid=_id, deleted_ind=False).one_or_none()
        except ValueError:
            return None

    @classmethod
    def find_by_irt_id(cls, _id):
        try:
            return cls.query.filter_by(irt_id=_id, deleted_ind=False).one_or_none()
        except ValueError:
            return None

    @classmethod
    def find_by_project_guid(cls, _id):
        try:
            return cls.query.filter_by(
                project_guid=_id, deleted_ind=False).order_by(cls.irt_id.desc()).first()
        except ValueError:
            return None

    def update(self, irt_json, add_to_session=True):
        self.status_code = irt_json['status_code']

        for updated_req in irt_json['requirements']:
            saved = False
            for requirement in self.requirements:
                if str(requirement.requirement_guid) == str(updated_req['requirement_guid']):
                    requirement.update(updated_req['required'], updated_req['methods'],
                                       updated_req['comment'])
                    requirement.save()
                    saved = True
                    break

            if not saved:
                new_req = IRTRequirementsXref.create(irt_json['irt_guid'],
                                                     updated_req['requirement_guid'],
                                                     updated_req['required'],
                                                     updated_req['methods'], updated_req['comment'])
                self.requirements.append(new_req)
                self.save()

        if add_to_session:
            self.save(commit=False)

        return self

    def delete(self):
        requirements = IRTRequirementsXref.find_by_irt_guid(self.irt_guid)
        if requirements:
            for requirement in requirements:
                requirement.delete()

        super(InformationRequirementsTable, self).delete()

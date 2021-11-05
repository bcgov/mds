import uuid, datetime
from flask.globals import current_app

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy

from sqlalchemy.schema import FetchedValue
from app.extensions import db

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base

from app.api.services.email_service import EmailService
from app.config import Config


class ProjectSummary(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'project_summary'

    project_summary_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    project_summary_guid = db.Column(
        UUID(as_uuid=True), nullable=False, server_default=FetchedValue())
    project_summary_description = db.Column(db.String, nullable=False)
    project_summary_date = db.Column(db.DateTime, nullable=False)
    deleted_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)

    # Note there is a dependency on deleted_ind in mine_documents
    documents = db.relationship('MineIncidentDocumentXref', lazy='joined')
    mine_documents = db.relationship(
        'MineDocument',
        lazy='joined',
        secondary='mine_incident_document_xref',
        secondaryjoin=
        'and_(foreign(MineIncidentDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid),MineDocument.deleted_ind == False)'
    )

    mine_table = db.relationship('Mine', lazy='joined')
    mine_name = association_proxy('mine_table', 'mine_name')
    mine_region = association_proxy('mine_table', 'mine_region')
    major_mine_ind = association_proxy('mine_table', 'major_mine_ind')

    # @classmethod
    # def find_by_mine_incident_guid(cls, _id):
    #     try:
    #         uuid.UUID(_id, version=4)
    #         return cls.query.filter_by(mine_incident_guid=_id, deleted_ind=False).first()
    #     except ValueError:
    #         return None

    # @classmethod
    # def create(cls,
    #            mine,
    #            incident_timestamp,
    #            incident_description,
    #            determination_type_code=None,
    #            mine_determination_type_code=None,
    #            mine_determination_representative=None,
    #            followup_investigation_type_code=None,
    #            reported_timestamp=None,
    #            reported_by_name=None,
    #            add_to_session=True):
    #     mine_incident = cls(
    #         incident_timestamp=incident_timestamp,
    #         incident_description=incident_description,
    #         reported_timestamp=reported_timestamp,
    #         reported_by_name=reported_by_name,
    #         determination_type_code=determination_type_code,
    #         mine_determination_type_code=mine_determination_type_code,
    #         mine_determination_representative=mine_determination_representative,
    #         followup_investigation_type_code=followup_investigation_type_code,
    #     )
    #     mine.mine_incidents.append(mine_incident)
    #     if add_to_session:
    #         mine_incident.save(commit=False)
    #     return mine_incident

    # def send_incidents_email(self):
    #     recipients = [INCIDENTS_EMAIL]

    #     subject = f'Incident Notification for {self.mine_table.mine_name}'
    #     body = f'<p>{self.mine_table.mine_name} (Mine no: {self.mine_table.mine_no}) has reported an incident in MineSpace.</p>'
    #     body += f'<p>Incident type(s): {", ".join(element.description for element in self.categories)}'
    #     body += f'<p><b>Incident information: </b>{self.incident_description}</p>'

    #     link = f'{Config.CORE_PRODUCTION_URL}/mine-dashboard/{self.mine.mine_guid}/oversight/incidents-and-investigations'
    #     body += f'<p>View updates in Core: <a href="{link}" target="_blank">{link}</a></p>'
    #     EmailService.send_email(subject, recipients, body)

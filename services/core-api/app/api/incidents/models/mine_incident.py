from sre_constants import IN
import uuid
import datetime

from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy

from sqlalchemy.schema import FetchedValue
from app.extensions import db

from .mine_incident_followup_investigation_type import MineIncidentFollowupInvestigationType

from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.incidents.models.mine_incident_determination_type import MineIncidentDeterminationType
from app.api.incidents.models.mine_incident_do_subparagraph import MineIncidentDoSubparagraph
from app.api.incidents.models.mine_incident_recommendation import MineIncidentRecommendation
from app.api.incidents.models.mine_incident_note import MineIncidentNote
from app.api.compliance.models.compliance_article import ComplianceArticle
from app.api.services.email_service import EmailService
from app.api.parties.party.models.party import Party
from app.config import Config
from app.api.constants import INCIDENTS_EMAIL, MDS_EMAIL


def getYear():
    return datetime.datetime.utcnow().year


def format_incident_date(datetime_string):
    return datetime_string.strftime('%b %d %Y, at %-H:%M')


class MineIncident(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'mine_incident'

    mine_incident_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_incident_id_year = db.Column(db.Integer, nullable=False)
    mine_incident_guid = db.Column(
        UUID(as_uuid=True), nullable=False, server_default=FetchedValue())

    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)

    incident_timestamp = db.Column(db.DateTime, nullable=False)
    incident_description = db.Column(db.String, nullable=False)

    reported_timestamp = db.Column(db.DateTime)
    reported_by_name = db.Column(db.String)
    reported_by_email = db.Column(db.String)
    reported_by_phone_no = db.Column(db.String)
    reported_by_phone_ext = db.Column(db.String)

    number_of_fatalities = db.Column(db.Integer)
    number_of_injuries = db.Column(db.Integer)
    emergency_services_called = db.Column(db.Boolean)
    followup_inspection = db.Column(db.Boolean)
    followup_inspection_date = db.Column(db.DateTime)

    mms_insp_cd = db.Column(db.String)

    immediate_measures_taken = db.Column(db.String)
    injuries_description = db.Column(db.String)
    johsc_worker_rep_name = db.Column(db.String(255))
    johsc_worker_rep_contacted = db.Column(db.Boolean)
    johsc_worker_rep_contact_method = db.Column(db.String)
    johsc_worker_rep_contact_timestamp = db.Column(db.DateTime)
    johsc_management_rep_name = db.Column(db.String(255))
    johsc_management_rep_contacted = db.Column(db.Boolean)
    johsc_management_rep_contact_method = db.Column(db.String)
    johsc_management_rep_contact_timestamp = db.Column(db.DateTime)
    reported_to_inspector_contacted = db.Column(db.Boolean)
    reported_to_inspector_contact_method = db.Column(db.String)

    reported_to_inspector_party_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=False)
    responsible_inspector_party_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=False)
    determination_inspector_party_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('party.party_guid'), nullable=False)

    proponent_incident_no = db.Column(db.String)
    mine_incident_no = db.Column(db.String)

    determination_type_code = db.Column(
        db.String,
        db.ForeignKey('mine_incident_determination_type.mine_incident_determination_type_code'))

    status_code = db.Column(db.String,
                            db.ForeignKey('mine_incident_status_code.mine_incident_status_code'))

    followup_investigation_type_code = db.Column(
        db.String,
        db.ForeignKey(
            'mine_incident_followup_investigation_type.mine_incident_followup_investigation_type_code'
        ))
    mine_determination_type_code = db.Column(
        db.String,
        db.ForeignKey('mine_incident_determination_type.mine_incident_determination_type_code'))
    mine_determination_representative = db.Column(db.String)

    determination_type = db.relationship(
        'MineIncidentDeterminationType',
        backref='mine_incidents',
        lazy='joined',
        uselist=False,
        foreign_keys=[determination_type_code])
    dangerous_occurrence_subparagraphs = db.relationship(
        'ComplianceArticle',
        backref='mine_incidents',
        lazy='joined',
        secondary='mine_incident_do_subparagraph')
    followup_investigation_type = db.relationship(
        'MineIncidentFollowupInvestigationType',
        backref='mine_incidents',
        lazy='joined',
        uselist=False)

    recommendations = db.relationship(
        'MineIncidentRecommendation',
        primaryjoin="and_(MineIncidentRecommendation.mine_incident_id == MineIncident.mine_incident_id, MineIncidentRecommendation.deleted_ind==False)",
        lazy='selectin')

    responsible_inspector = db.relationship(
        'Party',
        primaryjoin="and_(Party.party_guid == MineIncident.responsible_inspector_party_guid)",
        lazy='selectin')

    reported_to_inspector = db.relationship(
        'Party',
        primaryjoin="and_(Party.party_guid == MineIncident.reported_to_inspector_party_guid)",
        lazy='selectin')

    # Note there is a dependency on deleted_ind in mine_documents
    documents = db.relationship('MineIncidentDocumentXref', lazy='joined')
    mine_documents = db.relationship(
        'MineDocument',
        lazy='joined',
        secondary='mine_incident_document_xref',
        secondaryjoin='and_(foreign(MineIncidentDocumentXref.mine_document_guid) == remote(MineDocument.mine_document_guid),MineDocument.deleted_ind == False)'
    )

    categories = db.relationship(
        'MineIncidentCategory', lazy='joined', secondary='mine_incident_category_xref')
    mine_incident_notes = db.relationship(
        'MineIncidentNote',
        backref='mine_incident',
        lazy='select',
        primaryjoin='and_(MineIncidentNote.mine_incident_guid == MineIncident.mine_incident_guid, MineIncidentNote.deleted_ind == False)'
    )

    mine_table = db.relationship('Mine', lazy='joined')
    mine_name = association_proxy('mine_table', 'mine_name')
    mine_region = association_proxy('mine_table', 'mine_region')
    major_mine_ind = association_proxy('mine_table', 'major_mine_ind')

    @hybrid_property
    def reported_to_inspector_party(self):
        if self.reported_to_inspector_party_guid:
            party = Party.find_by_party_guid(self.reported_to_inspector_party_guid)
            return party.name
        return None

    @hybrid_property
    def responsible_inspector_party(self):
        if self.responsible_inspector_party_guid:
            party = Party.find_by_party_guid(self.responsible_inspector_party_guid)
            return party.name
        return None

    def delete(self):
        if self.mine_documents:
            for document in self.mine_documents:
                document.delete()
        super(MineIncident, self).delete()

    @hybrid_property
    def mine_incident_report_no(self):
        return str(self.mine_incident_id_year) + '-' + str(self.mine_incident_id)

    @hybrid_property
    def dangerous_occurrence_subparagraph_ids(self):
        return [sub.compliance_article_id for sub in self.dangerous_occurrence_subparagraphs]

    @classmethod
    def find_by_mine_incident_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(mine_incident_guid=_id, deleted_ind=False).first()
        except ValueError:
            return None

    @classmethod
    def create(cls,
               mine,
               incident_timestamp,
               incident_description,
               determination_type_code=None,
               mine_determination_type_code=None,
               mine_determination_representative=None,
               followup_investigation_type_code=None,
               reported_timestamp=None,
               reported_by_name=None,
               add_to_session=True):
        mine_incident = cls(
            incident_timestamp=incident_timestamp,
            incident_description=incident_description,
            reported_timestamp=reported_timestamp,
            reported_by_name=reported_by_name,
            determination_type_code=determination_type_code,
            mine_determination_type_code=mine_determination_type_code,
            mine_determination_representative=mine_determination_representative,
            followup_investigation_type_code=followup_investigation_type_code,
        )
        mine.mine_incidents.append(mine_incident)
        if add_to_session:
            mine_incident.save(commit=False)
        return mine_incident

    @validates('reported_by')
    def validate_reported_by(self, key, reported_by):
        if reported_by:
            if len(reported_by) > 100:
                raise AssertionError('reported_by must not exceed 100 characters.')
        return reported_by

    @validates('reported_by_role')
    def validate_reported_by_role(self, key, reported_by_role):
        if reported_by_role:
            if len(reported_by_role) > 100:
                raise AssertionError('reported_by_role must not exceed 100 characters.')
        return reported_by_role

    @validates('followup_inspection_number')
    def validate_followup_inspection_number(self, key, followup_inspection_number):
        if followup_inspection_number:
            if len(followup_inspection_number) > 20:
                raise AssertionError('followup_inspection_number must not exceed 100 characters.')
        return followup_inspection_number

    @validates('incident_timestamp')
    def validate_incident_timestamp(self, key, incident_timestamp):
        if incident_timestamp:
            if incident_timestamp > datetime.datetime.utcnow():
                raise AssertionError('incident_timestamp must not be in the future')
        return incident_timestamp

    @validates('reported_timestamp')
    def validate_reported_timestamp(self, key, reported_timestamp):
        if reported_timestamp:
            if reported_timestamp > datetime.datetime.utcnow():
                raise AssertionError('reported_timestamp must not be in the future')
        return reported_timestamp

    @validates(name=['reported_to_inspector_contact_method', 'johsc_worker_rep_contact_method', 'johsc_management_rep_contact_method'])
    def validates_contact_method(self, key, value):
        if value:
            if value not in ['PHN', 'EML', 'MRP', 'MRE']:
                raise AssertionError(f'{key} must use a valid option')
        return value

    def send_incidents_email(self):
        emli_recipients = [INCIDENTS_EMAIL]
        cc = [MDS_EMAIL]
        minespace_recipients = [self.reported_by_email]
        duration = self.reported_timestamp - self.incident_timestamp
        duration_in_s = duration.total_seconds()
        days = divmod(duration_in_s, 86400)
        hours = divmod(days[1], 3600)

        emli_body = open("app/templates/email/incident/emli_incident_email.html", "r").read()
        minespace_body = open("app/templates/email/incident/minespace_incident_email.html", "r").read()
        subject = f'{self.mine_table.mine_name}: A new notice of reportable incident has been created'
        categories = ", ".join(element.description for element in self.categories)
        emli_context = {
            "incident": {
                "mine_incident_report_no": self.mine_incident_report_no,
                "incident_timestamp": self.incident_timestamp.strftime('%b %d %Y at %H:%M'),
                "reported_timestamp": self.reported_timestamp.strftime('%b %d %Y at %H:%M'),
                "report_time_diff": f'{int(days[0])} days and {int(hours[0])} hours',
                "reported_by_name": self.reported_by_name,
                "catagories": categories,
                "incident_description": self.incident_description,
            },
            "mine": {
                "mine_name": self.mine_table.mine_name,
                "mine_no": self.mine_table.mine_no,
            },
            "incident_link": f'{Config.CORE_PRODUCTION_URL}/mines/{self.mine.mine_guid}/incidents/{self.mine_incident_guid}',
        }

        minespace_context = {
            "incident": {
                "mine_incident_report_no": self.mine_incident_report_no,
            },
            "mine": {
                "mine_name": self.mine_table.mine_name,
                "mine_no": self.mine_table.mine_no,
            },
            "minespace_incident_link": f'{Config.MINESPACE_PRODUCTION_URL}/mines/{self.mine.mine_guid}/incidents/{self.mine_incident_guid}',
        }

        EmailService.send_template_email(subject, emli_recipients, emli_body, emli_context, cc=cc)
        EmailService.send_template_email(subject, minespace_recipients, minespace_body, minespace_context, cc=cc, send_to_proponent=True)

    def send_awaiting_final_report_email(self, is_prop):
        OCI_EMAIL = self.reported_to_inspector.email if self.reported_to_inspector is not None else None
        PROP_EMAIL = self.reported_by_email
        recipients = [PROP_EMAIL if is_prop else OCI_EMAIL]

        subject = f'[CORE] An {", ".join(element.description for element in self.categories)}, {self.determination_type.description} ({self.mine_incident_report_no}) has been reported at {self.mine_name} ({self.mine_table.mine_no}) on {format_incident_date(self.incident_timestamp)}'

        body = f'<p>{self.mine_table.mine_name} (Mine no: {self.mine_table.mine_no}) has reported an incident in MineSpace.</p>'
        body += f'<p>Incident type(s): {", ".join(element.description for element in self.categories)}'
        body += f'<p><b>Incident information: </b>{self.incident_description}</p>'
        link = ''
        if is_prop:
            link = f'{Config.MINESPACE_PRODUCTION_URL}/mines/{self.mine.mine_guid}/incidents/{self.mine_incident_guid}/review'
            body += f'<p>View updates in Minespace: <a href="{link}" target="_blank">{link}</a></p>'
        else:
            link = f'{Config.CORE_PRODUCTION_URL}/mines/{self.mine.mine_guid}/incidents/{self.mine_incident_guid}'
            body += f'<p>View updates in Core: <a href="{link}" target="_blank">{link}</a></p>'

        EmailService.send_email(subject, recipients, body, send_to_proponent=is_prop)

    def send_final_report_received_email(self, is_prop):
        OCI_EMAIL = self.reported_to_inspector.email if self.reported_to_inspector is not None else None
        PROP_EMAIL = self.reported_by_email
        recipients = [PROP_EMAIL if is_prop else OCI_EMAIL]

        subject = f'[CORE] A final report has been submitted by {self.mine_name} ({self.mine_table.mine_no}) for the incident ({self.mine_incident_report_no}) on {format_incident_date(self.incident_timestamp)}'

        body = f'<p>{self.mine_table.mine_name} (Mine no: {self.mine_table.mine_no}) has had a final report submitted for the incident ({self.mine_incident_report_no}).</p>'
        body += f'<p>Incident type(s): {", ".join(element.description for element in self.categories)}'
        body += f'<p><b>Incident information: </b>{self.incident_description}</p>'
        link = ''
        if is_prop:
            link = f'{Config.MINESPACE_PRODUCTION_URL}/mines/{self.mine.mine_guid}/incidents/{self.mine_incident_guid}/review'
            body += f'<p>View the report in Minespace: <a href="{link}" target="_blank">{link}</a></p>'
        else:
            link = f'{Config.CORE_PRODUCTION_URL}/mines/{self.mine.mine_guid}/incidents/{self.mine_incident_guid}'
            body += f'<p>View the report in Core: <a href="{link}" target="_blank">{link}</a></p>'

        EmailService.send_email(subject, recipients, body, send_to_proponent=is_prop)

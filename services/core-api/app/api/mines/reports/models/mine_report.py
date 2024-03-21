import datetime
import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy import select, and_, desc, func, literal
from app.api.mines.reports.models.mine_report_contact import MineReportContact
from app.api.mines.reports.models.mine_report_submission import MineReportSubmission
from app.api.mines.reports.models.mine_report_submission_status_code import MineReportSubmissionStatusCode
from app.api.constants import MINE_REPORT_TYPE
from app.extensions import db
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.utils.include.user_info import User
from app.api.services.email_service import EmailService
from app.config import Config
from app.api.constants import MAJOR_MINES_OFFICE_EMAIL, MDS_EMAIL, PERM_RECL_EMAIL
from app.api.activity.utils import trigger_notification
from app.api.activity.models.activity_notification import ActivityType
from app.api.mines.reports.models.mine_report_notification import MineReportNotification

class MineReport(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = "mine_report"
    mine_report_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_report_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue(), nullable=False)

    mine_report_definition_id = db.Column(
        db.Integer,
        db.ForeignKey('mine_report_definition.mine_report_definition_id'),
    )
    mine_report_definition = db.relationship('MineReportDefinition', lazy='joined')
    mine_report_definition_guid = association_proxy('mine_report_definition',
                                                    'mine_report_definition_guid')
    mine_report_definition_report_name = association_proxy('mine_report_definition', 'report_name')

    submitter_name = db.Column(db.String, nullable=False)
    submitter_email = db.Column(db.String, nullable=False)

    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)
    mine = db.relationship('Mine', lazy='joined', back_populates='mine_reports')
    mine_name = association_proxy('mine', 'mine_name')
    mine_region = association_proxy('mine', 'mine_region')
    major_mine_ind = association_proxy('mine', 'major_mine_ind')

    permit_id = db.Column(db.Integer, db.ForeignKey('permit.permit_id'))
    permit = db.relationship('Permit', lazy='selectin')
    permit_guid = association_proxy('permit', 'permit_guid')
    permit_number = association_proxy('permit', 'permit_no')

    received_date = db.Column(db.DateTime)
    due_date = db.Column(db.DateTime)
    submission_year = db.Column(db.Integer)

    mine_report_submissions = db.relationship(
        'MineReportSubmission',
        lazy='select',
        order_by='asc(MineReportSubmission.mine_report_submission_id)',
        uselist=True,
        back_populates='report')
    
    latest_submission = db.relationship(
        'MineReportSubmission',
        primaryjoin="and_(MineReportSubmission.mine_report_id == MineReport.mine_report_id, MineReportSubmission.is_latest==True)",
        lazy='joined',
        overlaps="mine_report_submissions,report",
        uselist=False,
    )

    mine_report_contacts = db.relationship(
        'MineReportContact',
        lazy='joined',
        order_by='asc(MineReportContact.mine_report_contact_id)',
        uselist=True)

    created_by_idir = db.Column(db.String, nullable=False, default=User().get_user_username)

    # mine_permit_report related
    permit_condition_category = db.relationship('PermitConditionCategory', lazy='joined')
    permit_condition_category_code = db.Column(
        db.String, db.ForeignKey('permit_condition_category.condition_category_code'))
    permit_condition_category_description = association_proxy('permit_condition_category',
                                                              'description')
    description_comment = db.Column(db.String)

    # The below hybrid properties/expressions exist solely for filtering and sorting purposes.

    @hybrid_property
    def mine_report_status_code(self):
        if self.latest_submission:
            return self.latest_submission.mine_report_submission_status_code
        else:
            return "NON"
        
    @hybrid_property
    def report_type(self):
        return "PRR" if self.permit_condition_category_code else "CRR"

    @hybrid_property
    def report_name(self):
        return self.mine_report_definition_report_name if self.mine_report_definition_report_name else self.permit_condition_category_description

    @mine_report_status_code.expression
    def mine_report_status_code(cls):
        return func.coalesce(select([
            MineReportSubmission.mine_report_submission_status_code
        ]).where(and_(MineReportSubmission.mine_report_id == cls.mine_report_id,
                      MineReportSubmission.is_latest == True)).as_scalar(),
            literal("NON"))

    @hybrid_property
    def mine_report_status_description(self):
        if self.latest_submission:
            return MineReportSubmissionStatusCode.find_by_mine_report_submission_status_code(
                self.mine_report_status_code).description
        else:
            return None

    @mine_report_status_description.expression
    def mine_report_status_description(cls):
        return select([MineReportSubmissionStatusCode.description]).where(
            and_(
                MineReportSubmission.mine_report_id == cls.mine_report_id,
                MineReportSubmission.is_latest == True,
                MineReportSubmissionStatusCode.mine_report_submission_status_code ==
                MineReportSubmission.mine_report_submission_status_code)).as_scalar()

    def __repr__(self):
        return '<MineReport %r>' % self.mine_report_guid

    def send_report_update_email(self, is_edit, is_proponent, crr_or_prr):
        report_type_title = ""
        report_type_url = ""
        if crr_or_prr == "CRR":
            report_type_title = "Code Required Report"
            report_type_url = "code"

        if crr_or_prr == "PRR":
            report_type_title = "Permit Required Report"
            report_type_url = "permit"

        subject_verb = 'Updated' if is_edit else 'Submitted'
        subject = f'{report_type_title} {subject_verb} for {self.mine.mine_name}'
        core_recipients = [MDS_EMAIL]
        ms_recipients = []

        if not is_edit:

            # Adding submitter's email
            if self.submitter_email:
                if is_proponent:
                    ms_recipients.append(self.submitter_email)
                else:
                    core_recipients.append(self.submitter_email)

            # Adding submitter's email
            contacts_email = [contact.email for contact in self.mine_report_submissions[0].mine_report_contacts]
            if contacts_email:
                if is_proponent:
                    ms_recipients.extend(contacts_email)
                else:
                    core_recipients.extend(contacts_email)

            # Adding mine manager's email.
            if self.mine.mine_party_appt:
                for party in self.mine.mine_party_appt:

                    if party.mine_party_appt_type_code == "MMG" and party.party.email:
                        ms_recipients.append(party.party.email)

            # If no core_recipients found yet
            if len(core_recipients) == 0:
                core_recipients = PERM_RECL_EMAIL

            core_recipients.extend(self.getReportSpecificEmailsByReportType())

            core_report_page_link =  f'{Config.CORE_PRODUCTION_URL}/mine-dashboard/{self.mine.mine_guid}/required-reports/{report_type_url}-required-reports'
            ms_report_page_link = f'{Config.MINESPACE_PRODUCTION_URL}/mines/{self.mine.mine_guid}/reports'
            c_article = self.mine_report_definition.compliance_articles[0]
            report_type = f'{c_article.section}.{c_article.sub_section}.{c_article.paragraph} - {self.mine.mine_name}'

            recieved_date = self.mine_report_submissions[0].received_date
            due_date = "N/A"
            if self.due_date:
                due_date = (self.due_date).strftime("%b %d %Y")

            email_context = {
              "report_submision": {
                  "mine_number": self.mine.mine_no,
                  "mine_name": self.mine.mine_name,
                  "report_name": self.mine_report_definition_report_name,
                  "report_type": report_type,
                  "report_compliance_year": self.mine_report_submissions[0].submission_year,
                  "report_due_date": due_date,
                  "report_recieved_date": (recieved_date).strftime("%b %d %Y at %I:%M %p"),
              },
              "minespace_login_link": Config.MINESPACE_PRODUCTION_URL,
              "core_report_page_link": core_report_page_link,
              "ms_report_page_link": ms_report_page_link
            }

            trigger_notification(f'Your ({self.mine_report_definition_report_name}) report has been recieved',
                                 ActivityType.mine_report_submitted, self.mine,
                                 'MineReportSubmission', self.mine_report_guid)

            core_email_body = open("app/templates/email/report/core_new_report_submitted_email.html", "r").read()
            EmailService.send_template_email(subject, core_recipients, core_email_body, email_context, cc=None)

            ms_email_body = open("app/templates/email/report/ms_new_report_submitted_email.html", "r").read()
            EmailService.send_template_email(subject, ms_recipients, ms_email_body, email_context, cc=None)

        else:
            recipients = [self.mine.region.regional_contact_office.email, MDS_EMAIL]
            if self.mine.major_mine_ind:
                recipients = [MAJOR_MINES_OFFICE_EMAIL, MDS_EMAIL]

            subject_verb = 'Updated' if is_edit else 'Submitted'
            subject = f'Code Required Report {subject_verb} for {self.mine.mine_name}'

            body_verb = 'uploaded document(s) to' if is_edit else 'submitted'
            body = f'<p>{self.mine.mine_name} (Mine no: {self.mine.mine_no}) has {body_verb} a "{self.mine_report_definition_report_name}" report.</p>'

            link = f'{Config.CORE_PRODUCTION_URL}/mine-dashboard/{self.mine.mine_guid}/reports/code-required-reports'
            body += f'<p>View updates in Core: <a href="{link}" target="_blank">{link}</a></p>'
            EmailService.send_email(subject, recipients, body)

    def getReportSpecificEmailsByReportType(self):
            art = self.mine_report_definition.compliance_articles[0]
            notificaiton_list = MineReportNotification.find_contact_by_compliance_article(art.section, art.sub_section, art.paragraph, art.sub_paragraph)
            unique_recipients = set()
            regional_email = self.mine.region.regional_contact_office.email

            for ntf in notificaiton_list:
                notifiy_email = ntf[0]
                if notifiy_email not in unique_recipients:
                    unique_recipients.add(notifiy_email)

                if ntf[1]:
                    if PERM_RECL_EMAIL not in unique_recipients:
                        unique_recipients.add(PERM_RECL_EMAIL)
                if ntf[2]:
                    if regional_email not in unique_recipients:
                        unique_recipients.add(regional_email)

            return list(unique_recipients)

    @classmethod
    def create(cls,
               mine_report_definition_id,
               mine_guid,
               due_date,
               received_date,
               submission_year,
               description_comment,
               submitter_name,
               permit_id=None,
               permit_condition_category_code=None,
               submitter_email=None,
               add_to_session=True):
        mine_report = cls(
            mine_report_definition_id=mine_report_definition_id,
            mine_guid=mine_guid,
            due_date=due_date,
            received_date=received_date,
            submission_year=submission_year,
            description_comment=description_comment,
            permit_id=permit_id,
            permit_condition_category_code=permit_condition_category_code,
            submitter_name=submitter_name,
            submitter_email=submitter_email)
        if add_to_session:
            mine_report.save(commit=False)
        return mine_report

    @classmethod
    def find_by_mine_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(mine_guid=_id).filter_by(deleted_ind=False).all()
        except ValueError:
            return None

    @classmethod
    def find_by_mine_report_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(mine_report_guid=_id).first()
        except ValueError:
            return None

    @classmethod
    def find_by_mine_guid_and_category(cls, _id, category):
        try:
            uuid.UUID(_id, version=4)
            reports = cls.query.filter(
                MineReport.permit_condition_category_code.is_(None)).filter_by(mine_guid=_id).all()
            return [
                r for r in reports if category.upper() in
                [c.mine_report_category.upper() for c in r.mine_report_definition.categories]
            ]
        except ValueError:
            return None

    @classmethod
    def find_by_mine_guid_and_report_type(cls,
                                          _id,
                                          reports_type=MINE_REPORT_TYPE['CODE REQUIRED REPORTS']):
        try:
            uuid.UUID(_id, version=4)
            reports = cls.query.filter_by(mine_guid=_id).filter_by(deleted_ind=False).order_by(
                cls.due_date.asc())
            if reports_type == MINE_REPORT_TYPE['PERMIT REQUIRED REPORTS']:
                reports = reports.filter(MineReport.permit_condition_category_code.isnot(None))
            elif reports_type == MINE_REPORT_TYPE['CODE REQUIRED REPORTS']:
                reports = reports.filter(MineReport.permit_condition_category_code.is_(None))
            return reports.all()
        except ValueError:
            return None

    @validates('mine_report_definition_id')
    def validate_mine_report_definition_id(self, key, mine_report_definition_id):
        if mine_report_definition_id and self.permit_condition_category_code:
            raise AssertionError(
                'Code required reports must not specify permit required report specific data.')
        return mine_report_definition_id

    @validates('permit_condition_category_code')
    def validate_permit_condition_category(self, key, permit_condition_category_code):
        if permit_condition_category_code and self.mine_report_definition_id:
            raise AssertionError(
                'Permit required reports must not specify Code required reports specific data.')
        return permit_condition_category_code
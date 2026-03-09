import uuid
from datetime import date, datetime

from app.api.activity.models.activity_notification import (
    ActivityRecipients,
    ActivityType,
)
from app.api.activity.utils import trigger_notification
from app.api.compliance.models.compliance_article import ComplianceArticle
from app.api.constants import (
    MAJOR_MINES_OFFICE_EMAIL,
    MDS_EMAIL,
    MINE_REPORT_TYPE,
    PERM_RECL_EMAIL,
)
from app.api.mines.exceptions.mine_exceptions import MineException
from app.api.mines.reports.models.mine_report_contact import MineReportContact
from app.api.mines.reports.models.mine_report_notification import MineReportNotification
from app.api.mines.reports.models.mine_report_submission import MineReportSubmission
from app.api.mines.reports.models.mine_report_submission_status_code import (
    MineReportSubmissionStatusCode,
)
from app.api.services.email_service import EmailService
from app.api.utils.helpers import (
    format_email_datetime_to_string,
    get_current_core_or_ms_env_url,
)
from app.api.utils.include.user_info import User
from app.api.utils.models_mixins import AuditMixin, Base, SoftDeleteMixin
from app.config import Config
from app.extensions import db
from flask import current_app
from pytz import timezone as pytz_timezone
from sqlalchemy import and_, desc, func, literal, select, exists, or_
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from typing import Self


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
    mine_report_permit_requirement_id = db.Column(
        db.Integer,
        db.ForeignKey('mine_report_permit_requirement.mine_report_permit_requirement_id'),
    )
    mine_report_permit_requirement = db.relationship('MineReportPermitRequirement', lazy='joined')

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

    received_date: date = db.Column(db.Date)
    due_date: date = db.Column(db.Date)
    submission_year = db.Column(db.Integer)

    mine_report_submissions = db.relationship(
        'MineReportSubmission',
        lazy='select',
        order_by='asc(MineReportSubmission.mine_report_submission_id)',
        uselist=True,
        back_populates='report')

    latest_submission = db.relationship(
        'MineReportSubmission',
        primaryjoin=
        "and_(MineReportSubmission.mine_report_id == MineReport.mine_report_id, MineReportSubmission.is_latest==True)",
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
    def is_overdue(self) -> bool:
        """
        Determine if the report is overdue as of the given date.
        A report is considered overdue for reports with a due date after April 1, 2025,
        as that is when report submissions became mandatory through Minespace.
        """
        as_of_date = datetime.now(pytz_timezone('US/Pacific')).date()
        april_1_2025 = date(2025, 4, 1)

        due_dt = self.due_date
        if isinstance(due_dt, datetime):
            due_dt = due_dt.date()

        return (due_dt is not None and
                due_dt < as_of_date and
                due_dt >= april_1_2025 and
                self.mine_report_status_code == 'NON')

    @is_overdue.expression
    def is_overdue(cls):
        from sqlalchemy import case
        april_1_2025 = date(2025, 4, 1)
        return case(
            (and_(
                cls.due_date.isnot(None),
                cls.due_date < func.now(),
                cls.due_date >= april_1_2025,
                cls.mine_report_status_code == 'NON'
            ), True),
            else_=False
        )

    @hybrid_property
    def report_type(self):
        return "PRR" if self.permit_condition_category_code or self.mine_report_permit_requirement_id else "CRR"

    @hybrid_property
    def report_name(self):
        if self.mine_report_definition_report_name:
            return self.mine_report_definition_report_name
        if self.permit_condition_category_description:
            return self.permit_condition_category_description
        return self.mine_report_permit_requirement.report_name

    @mine_report_status_code.expression
    def mine_report_status_code(cls):
        return func.coalesce(
            select([MineReportSubmission.mine_report_submission_status_code]).where(
                and_(MineReportSubmission.mine_report_id == cls.mine_report_id,
                     MineReportSubmission.is_latest == True)).as_scalar(), literal("NON"))

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

    def send_crr_and_prr_add_notification_email(self, is_proponent, crr_or_prr):
        is_crr = crr_or_prr == "CRR"
        report_code = "Code" if is_crr else "Permit"
        subject = f'{report_code} Required Report Submitted for mine {self.mine.mine_name}'
        core_recipients = [MDS_EMAIL]
        ms_recipients = []

        core_recipients, ms_recipients = self.collectRecipients(is_proponent)

        due_date = due_date = (self.due_date).strftime("%b %d %Y") if self.due_date else "N/A"

        core_url = get_current_core_or_ms_env_url("core")
        ms_url = get_current_core_or_ms_env_url("ms")

        core_report_page_link = f'{core_url}/dashboard/reporting/mine/{self.mine.mine_guid}/report/{self.mine_report_guid}'
        ms_report_page_link = f'{ms_url}/mines/{self.mine.mine_guid}/reports/{self.mine_report_guid}'
        report_name = ""

        if is_crr:
            report_type = "Code Required Report"
            compliance_details = self.mine_report_definition.compliance_articles[0]
            compliance_string = ComplianceArticle.get_compliance_article_string(
                self.mine_report_definition.compliance_articles[0])
            report_name = f'{compliance_string} - {compliance_details.description}'
            core_recipients.extend(self.getReportSpecificEmailsByReportType(compliance_details))

        else:                #PRR
            report_type = "Permit Required Report"
            report_name = self.report_name
            regional_email = self.mine.region.regional_contact_office.email
            if self.mine.major_mine_ind:
                core_recipients.append(PERM_RECL_EMAIL)
            else:
                core_recipients.append(regional_email)

        email_context = {
            "report_submision": {
                "mine_number":
                self.mine.mine_no,
                "mine_name":
                self.mine.mine_name,
                "report_name":
                report_name,
                "report_type":
                report_type,
                "report_compliance_year":
                self.submission_year,
                "report_due_date":
                due_date,
                "report_recieved_date":
                format_email_datetime_to_string(self.latest_submission.submission_date),
            },
            "minespace_login_link": ms_url,
            "core_report_page_link": core_report_page_link,
            "ms_report_page_link": ms_report_page_link
        }

        trigger_notification(
            f'Your {report_name} report has been received',
            ActivityType.mine_report_submitted,
            self.mine,
            'MineReport',
            self.mine_report_guid,
            recipients=ActivityRecipients.minespace_users)

        trigger_notification(
            f'A {report_name} report has been received',
            ActivityType.mine_report_submitted,
            self.mine,
            'MineReport',
            self.mine_report_guid,
            recipients=ActivityRecipients.core_users)

        core_template = "email/report/core_new_report_submitted_email.html"
        EmailService.send_template_email(
            subject, core_recipients, core_template, email_context, cc=None)

        ms_template = "email/report/ms_new_report_submitted_email.html"
        EmailService.send_template_email(
            subject, ms_recipients, ms_template, email_context, cc=None)

    def collectRecipients(self, is_proponent):
        core_recipients = [MDS_EMAIL]
        ms_recipients = []
        # Adding submitter's email
        if self.submitter_email:
            ms_recipients.append(self.submitter_email)

        # Adding submitter's email
        contacts_email = [
            contact.email for contact in self.mine_report_submissions[0].mine_report_contacts
        ]
        if contacts_email:
            if is_proponent:
                ms_recipients.extend(contacts_email)
            else:
                core_recipients.extend(contacts_email)

        # Adding mine manager's email.
        if self.mine.mine_manager:
            ms_recipients.append(self.mine.mine_manager.party.email)

        # If no core_recipients found yet
        if len(core_recipients) == 0:
            core_recipients = PERM_RECL_EMAIL

        return core_recipients, ms_recipients

    def getReportSpecificEmailsByReportType(self, compliance_details):
        notification_list = MineReportNotification.find_contact_by_compliance_article(
            compliance_details.section, compliance_details.sub_section,
            compliance_details.paragraph, compliance_details.sub_paragraph)
        unique_recipients = set()
        regional_email = self.mine.region.regional_contact_office.email

        for ntf in notification_list:
            notify_email = ntf[0]
            if notify_email not in unique_recipients:
                unique_recipients.add(notify_email)

            if ntf[1] and self.mine.major_mine_ind and PERM_RECL_EMAIL not in unique_recipients:
                unique_recipients.add(PERM_RECL_EMAIL)

            if ntf[2] and not self.mine.major_mine_ind and regional_email not in unique_recipients:
                unique_recipients.add(regional_email)

        return list(unique_recipients)

    def send_crr_report_update_email(self, is_edit):
        recipients = [self.mine.region.regional_contact_office.email, MDS_EMAIL]
        if self.mine.major_mine_ind:
            recipients = [MAJOR_MINES_OFFICE_EMAIL, MDS_EMAIL]

        subject_verb = 'Updated' if is_edit else 'Submitted'
        subject = f'Code Required Report {subject_verb} for {self.mine.mine_name}'

        body_verb = 'uploaded document(s) to' if is_edit else 'submitted'
        body = f'<p>{self.mine.mine_name} (Mine no: {self.mine.mine_no}) has {body_verb} a "{self.mine_report_definition_report_name}" report.</p>'

        link = f'{Config.CORE_WEB_URL}/mine-dashboard/{self.mine.mine_guid}/reports/code-required-reports'
        body += f'<p>View updates in Core: <a href="{link}" target="_blank">{link}</a></p>'
        EmailService.send_email(subject, recipients, body)

    def send_report_requested_email(self, report_name, is_crr):
        if self.mine.mine_manager:
            recipients = [self.mine.mine_manager.party.email]
        else:
            current_app.logger.info(
                f"Can't find mine manager's email for the mine: {self.mine.mine_name}")
            raise MineException(
                f"Couldn't send the email for the mine manager as no manager found for the mine: {self.mine.mine_name}"
            )

        if is_crr:
            compliance_details = self.mine_report_definition.compliance_articles[0]
            compliance_string = ComplianceArticle.get_compliance_article_string(
                self.mine_report_definition.compliance_articles[0])
            report_name = f'{compliance_string} - {compliance_details.description}'
            permit_info_value = ""
            permit_info_label = ""

        else:                #PRR
            report_name = self.report_name
            permit_info_label = "Permit Number"
            permit_info_value = self.permit_number + ": "

        subject = "A Report is requested in MineSpace"
        due_date = (self.due_date).strftime("%b %d %Y") if self.due_date else "N/A"
        ms_url = get_current_core_or_ms_env_url("ms")
        ms_report_page_link = f'{ms_url}/mines/{self.mine.mine_guid}/reports/{self.mine_report_guid}'

        email_context = {
            "report_request": {
                "mine_number": self.mine.mine_no,
                "mine_name": self.mine.mine_name,
                "permit_info_label": permit_info_label,
                "permit_info_value": permit_info_value,
                "report_name": report_name,
                "report_compliance_year": self.submission_year,
                "report_due_date": due_date,
            },
            "minespace_login_link": ms_url,
            "ms_report_page_link": ms_report_page_link
        }

        ms_template = "email/report/ms_new_report_requested_email.html"
        EmailService.send_template_email(subject, recipients, ms_template, email_context, cc=None)

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
               mine_report_permit_requirement_id=None,
               submitter_email=None,
               add_to_session=True,
               system_created=False):
        mine_report = cls(
            mine_report_definition_id=mine_report_definition_id,
            mine_guid=mine_guid,
            due_date=due_date,
            received_date=received_date,
            submission_year=submission_year,
            description_comment=description_comment,
            permit_id=permit_id,
            permit_condition_category_code=permit_condition_category_code,
            mine_report_permit_requirement_id=mine_report_permit_requirement_id,
            submitter_name=submitter_name,
            submitter_email=submitter_email,
            created_by_idir='system' if system_created else None,
            update_user='system' if system_created else None,
            create_user='system' if system_created else None)
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
    def create_from_permit_report_requirement(cls, requirement, due_date):
        """
        Create a MineReport from a MineReportPermitRequirement.
        This is used for creating recurring reports based on permit requirements.
        
        Args:
            requirement: MineReportPermitRequirement instance
            due_date: The specific due date for this report instance
        """
        # Import here to avoid circular import
        from app.api.mines.permits.permit_amendment.models.permit_amendment import PermitAmendment
        from app.api.mines.mine.models.mine import Mine
        
        # Get the permit amendment to find the mine
        permit_amendment = PermitAmendment.find_by_permit_amendment_id(requirement.permit_amendment_id)
        if not permit_amendment:
            raise ValueError(f"Could not find permit amendment with id {requirement.permit_amendment_id} for report requirement '{requirement.report_name}' (ID: {requirement.mine_report_permit_requirement_id})")
        
        # Get the mine directly from the permit amendment to avoid _context_mine requirement
        mine_guid = permit_amendment.mine_guid
        permit_id = permit_amendment.permit_id
        
        mine = Mine.find_by_mine_guid(mine_guid)
        if not mine:
            raise ValueError(f"Could not find mine with guid {mine_guid} for permit amendment {requirement.permit_amendment_id}")
        
        mine_report = cls.create(
            mine_report_definition_id=None,  # PRR reports don't use mine_report_definition
            mine_guid=mine.mine_guid,
            due_date=due_date,  # Use the passed-in due date
            received_date=None,  # Not received yet
            submission_year=None,  # Will be set when submitted
            description_comment=None,  # Will be set when submitted
            submitter_name="",  # Will be set when submitted
            permit_id=permit_id,
            permit_condition_category_code=None,  # PRR reports don't use this
            mine_report_permit_requirement_id=requirement.mine_report_permit_requirement_id,
            submitter_email="",  # Will be set when submitted
            add_to_session=True,
            system_created=True
        )
        
        return mine_report

    @classmethod
    def get_all_recurring_crr_reports(cls):
        from app.api.mines.reports.models.mine_report_definition import MineReportDefinition
        from app.api.mines.permits.permit.models.mine_permit_xref import MinePermitXref
        from app.api.mines.permits.permit.models.permit import Permit
        from app.api.mines.reports.models.mine_report_category_xref import MineReportCategoryXref
        from app.api.mines.tailings.models.tailings import MineTailingsStorageFacility
        from app.api.mines.reports.models.mine_report_definition_compliance_article_xref import \
            MineReportDefinitionComplianceArticleXref

        # Check to see if mine report's mine has an active permit
        active_permit_exists = exists().where(
            and_(
                MinePermitXref.mine_guid == cls.mine_guid,
                MinePermitXref.permit_id == Permit.permit_id,
                Permit.deleted_ind == False,
            )
        )

        # Check to see if mine report definition has TSF category
        definition_has_tsf = exists().where(
            and_(
                MineReportCategoryXref.mine_report_definition_id
                == cls.mine_report_definition_id,
                MineReportCategoryXref.mine_report_category == "TSF",
            )
        )

        # Check to see if mine has a tailings storage facility
        tsf_exists = exists().where(
            MineTailingsStorageFacility.mine_guid == cls.mine_guid
        )

        # Check if mine report definition is linked to at least one non-expired compliance article
        has_non_expired_compliance_article = exists().where(
            and_(
                MineReportDefinitionComplianceArticleXref.mine_report_definition_id
                == cls.mine_report_definition_id,
                MineReportDefinitionComplianceArticleXref.compliance_article_id
                == ComplianceArticle.compliance_article_id,
                or_(
                    ComplianceArticle.expiry_date.is_(None),  # treat null expiry as not expired
                    ComplianceArticle.expiry_date >= datetime.utcnow(),
                ),
            )
        )


        return (
            cls.query
            .join(
                MineReportDefinition,
                cls.mine_report_definition_id
                == MineReportDefinition.mine_report_definition_id,
            )
            .filter(
                cls.deleted_ind == False,
                cls.due_date != None,
                MineReportDefinition.active_ind.is_(True),
                MineReportDefinition.mine_report_due_date_type.in_(["FIS", "YRL"]),
                active_permit_exists,
                or_(
                    ~definition_has_tsf,
                    tsf_exists,
                ),
                has_non_expired_compliance_article,
            )
        )

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
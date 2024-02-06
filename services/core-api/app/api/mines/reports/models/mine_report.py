import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy import select, and_, desc
from app.api.mines.reports.models.mine_report_contact import MineReportContact
from app.api.mines.reports.models.mine_report_submission import MineReportSubmission
from app.api.mines.reports.models.mine_report_submission_status_code import MineReportSubmissionStatusCode
from app.api.constants import MINE_REPORT_TYPE
from app.extensions import db
from app.api.utils.models_mixins import SoftDeleteMixin, AuditMixin, Base
from app.api.utils.include.user_info import User
from app.api.services.email_service import EmailService
from app.config import Config
from app.api.constants import MAJOR_MINES_OFFICE_EMAIL, MDS_EMAIL


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
        lazy='joined',
        order_by='asc(MineReportSubmission.mine_report_submission_id)',
        uselist=True,
        back_populates='report')

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
        if self.mine_report_submissions:
            return self.mine_report_submissions[-1].mine_report_submission_status_code
        else:
            return None

    @hybrid_property
    def report_name(self):
        return self.mine_report_definition_report_name if self.mine_report_definition_report_name else self.permit_condition_category_description

    @mine_report_status_code.expression
    def mine_report_status_code(cls):
        return select([
            MineReportSubmission.mine_report_submission_status_code
        ]).where(MineReportSubmission.mine_report_id == cls.mine_report_id).order_by(
            desc(MineReportSubmission.mine_report_submission_id)).limit(1).as_scalar()

    @hybrid_property
    def mine_report_status_description(self):
        if self.mine_report_submissions:
            return MineReportSubmissionStatusCode.find_by_mine_report_submission_status_code(
                self.mine_report_status_code).description
        else:
            return None

    @mine_report_status_description.expression
    def mine_report_status_description(cls):
        return select([MineReportSubmissionStatusCode.description]).where(
            and_(
                MineReportSubmission.mine_report_id == cls.mine_report_id,
                MineReportSubmissionStatusCode.mine_report_submission_status_code ==
                MineReportSubmission.mine_report_submission_status_code)).order_by(
                    desc(MineReportSubmission.mine_report_submission_id)).limit(1).as_scalar()

    def __repr__(self):
        return '<MineReport %r>' % self.mine_report_guid

    def send_report_update_email(self, is_edit):
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
            else:
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
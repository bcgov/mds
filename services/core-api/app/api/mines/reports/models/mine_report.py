import uuid

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import column_property
from sqlalchemy import select, and_, desc, asc
from app.api.mines.reports.models.mine_report_submission import MineReportSubmission
from app.api.mines.reports.models.mine_report_submission_status_code import MineReportSubmissionStatusCode

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.utils.include.user_info import User


class MineReport(Base, AuditMixin):
    __tablename__ = "mine_report"
    mine_report_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    mine_report_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue(), nullable=False)

    mine_report_definition_id = db.Column(
        db.Integer,
        db.ForeignKey('mine_report_definition.mine_report_definition_id'),
        nullable=False)
    mine_report_definition = db.relationship('MineReportDefinition', lazy='joined')
    mine_report_definition_guid = association_proxy('mine_report_definition',
                                                    'mine_report_definition_guid')
    report_name = association_proxy('mine_report_definition', 'report_name')

    mine_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('mine.mine_guid'), nullable=False)
    mine = db.relationship('Mine', lazy='joined')
    mine_name = association_proxy('mine', 'mine_name')
    mine_region = association_proxy('mine', 'mine_region')
    major_mine_ind = association_proxy('mine', 'major_mine_ind')

    permit_id = db.Column(db.Integer, db.ForeignKey('permit.permit_id'))
    permit = db.relationship('Permit', lazy='selectin')
    permit_guid = association_proxy('permit', 'permit_guid')

    received_date = db.Column(db.DateTime)
    due_date = db.Column(db.DateTime)
    submission_year = db.Column(db.Integer)

    deleted_ind = db.Column(db.Boolean, server_default=FetchedValue(), nullable=False)

    mine_report_submissions = db.relationship(
        'MineReportSubmission',
        lazy='joined',
        order_by='asc(MineReportSubmission.mine_report_submission_id)',
        uselist=True)

    created_by_idir = db.Column(db.String, nullable=False, default=User().get_user_username)

    # The below hybrid properties/expressions exist solely for filtering and sorting purposes.

    @hybrid_property
    def mine_report_status_code(self):
        if self.mine_report_submissions:
            return self.mine_report_submissions[-1].mine_report_submission_status_code
        else:
            return None

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

    @classmethod
    def create(cls,
               mine_report_definition_id,
               mine_guid,
               due_date,
               received_date,
               submission_year,
               permit_id=None,
               add_to_session=True):
        mine_report = cls(
            mine_report_definition_id=mine_report_definition_id,
            mine_guid=mine_guid,
            due_date=due_date,
            received_date=received_date,
            submission_year=submission_year,
            permit_id=permit_id)
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
            reports = cls.query.filter_by(mine_guid=_id).all()
            return [
                r for r in reports if category.upper() in
                [c.mine_report_category.upper() for c in r.mine_report_definition.categories]
            ]
        except ValueError:
            return None
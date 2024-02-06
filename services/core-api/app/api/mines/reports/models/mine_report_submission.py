import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db

from sqlalchemy.ext.associationproxy import association_proxy


class MineReportSubmission(Base, AuditMixin):
    __tablename__ = "mine_report_submission"
    mine_report_submission_id = db.Column(db.Integer,
                                          primary_key=True,
                                          server_default=FetchedValue())
    mine_report_submission_guid = db.Column(UUID(as_uuid=True), server_default=FetchedValue())
    mine_report_id = db.Column(db.Integer, db.ForeignKey('mine_report.mine_report_id'))
    mine_report_submission_status_code = db.Column(
        db.String,
        db.ForeignKey('mine_report_submission_status_code.mine_report_submission_status_code'))
    submission_date = db.Column(db.DateTime)
    documents = db.relationship(
        'MineDocument', lazy='selectin', secondary='mine_report_document_xref')
    comments = db.relationship(
        'MineReportComment',
        order_by='MineReportComment.comment_datetime',
        primaryjoin="and_(MineReportComment.mine_report_submission_id == MineReportSubmission.mine_report_submission_id, MineReportComment.deleted_ind==False)",
        lazy='joined')

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
    mine = db.relationship('Mine', lazy='joined')
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
    permit_condition_category = db.relationship('PermitConditionCategory', lazy='joined')
    permit_condition_category_code = db.Column(
        db.String, db.ForeignKey('permit_condition_category.condition_category_code'))
    permit_condition_category_description = association_proxy('permit_condition_category',
                                                              'description')
    description_comment = db.Column(db.String)

    report = db.relationship('MineReport', lazy='joined', back_populates='mine_report_submissions')

    mine_report_guid = association_proxy('report', 'mine_report_guid')

    @hybrid_property
    def report_name(self):
        return self.mine_report_definition_report_name if self.mine_report_definition_report_name else self.permit_condition_category_description

    def __repr__(self):
        return '<MineReportSubmission %r>' % self.mine_report_submission_guid

    @classmethod
    def find_latest_by_mine_report_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(mine_report_guid=_id).order_by(cls.mine_report_submission_id.desc()).first()
        except ValueError:
            return None

    @classmethod
    def find_by_mine_report_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(mine_report_guid=_id).all()
        except ValueError:
            return None

    @classmethod
    def find_by_guid(cls, _id):
        try:
            uuid.UUID(_id, version=4)
            return cls.query.filter_by(mine_report_submission_guid=_id).first()
        except ValueError:
            return None

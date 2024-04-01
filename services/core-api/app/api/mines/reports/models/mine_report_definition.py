from datetime import datetime
from dateutil.relativedelta import relativedelta

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property

from app.api.utils.models_mixins import Base, AuditMixin
from app.extensions import db


class MineReportDefinition(Base, AuditMixin):
    __tablename__ = "mine_report_definition"
    mine_report_definition_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    mine_report_definition_guid = db.Column(UUID(as_uuid=True), nullable=False)
    report_name = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    due_date_period_months = db.Column(db.Integer, nullable=False)
    mine_report_due_date_type = db.Column(
        db.String,
        db.ForeignKey('mine_report_due_date_type.mine_report_due_date_type'),
        nullable=False)
    active_ind = db.Column(db.Boolean, server_default=FetchedValue(), nullable=False)
    is_common = db.Column(db.Boolean, server_default=FetchedValue(), nullable=False)
    is_prr_only = db.Column(db.Boolean, server_default=FetchedValue(), nullable=False)

    required = db.Column(db.Boolean)

    categories = db.relationship(
        'MineReportCategory', lazy='selectin', secondary='mine_report_category_xref')
    compliance_articles = db.relationship(
        'ComplianceArticle',
        lazy='selectin',
        secondary='mine_report_definition_compliance_article_xref')

    def __repr__(self):
        return '<MineReportDefinition %r>' % self.mine_report_definition_guid

    @hybrid_property
    def default_due_date(self):
        if self.due_date_period_months:
            return _calculate_due_date(datetime.utcnow(), self.mine_report_due_date_type,
                                       self.due_date_period_months)
        else:
            return None

    @classmethod
    def find_by_mine_report_definition_id(cls, _id):
        try:
            return cls.query.filter_by(mine_report_definition_id=_id).first()
        except ValueError:
            return None

    @classmethod
    def find_by_mine_report_definition_guid(cls, _id):
        try:
            return cls.query.filter_by(mine_report_definition_guid=_id).first()
        except ValueError:
            return None

    @classmethod
    def get_all(cls):
        try:
            return cls.query.all()
        except ValueError:
            return None

    @classmethod
    def find_required_reports_by_category(cls, _mine_report_category):
        try:
            return cls.query.filter_by(active_ind=True).filter_by(required=True).filter(
                MineReportDefinition.categories.any(
                    mine_report_category=_mine_report_category)).all()
        except ValueError:
            return None


def _calculate_due_date(current_date, due_date_type, period_in_months):
    current_year = current_date.year
    march = 3
    day = 31
    hour = 00
    minute = 00
    second = 00

    if due_date_type == 'FIS':

        fiscal_year_end = datetime(current_year, march, day, hour, minute, second)
        if current_date < fiscal_year_end:       #Jan - Mar
            tmp_date = fiscal_year_end - relativedelta(years=1)
        else:
            tmp_date = fiscal_year_end

        due_date = tmp_date + \
                relativedelta(months=int(period_in_months))

        return due_date

    # This is only stubbed out for the future logic that will have to go here.
    elif due_date_type == 'ANV':
        return current_date

    else:
        return current_date
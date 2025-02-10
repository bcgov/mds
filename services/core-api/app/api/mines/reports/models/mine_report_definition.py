import uuid
from datetime import datetime
from dateutil.relativedelta import relativedelta

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import or_, cast, Integer, nullsfirst, nullslast
from sqlalchemy_filters import apply_pagination
from app.api.mines.reports.models.mine_report_permit_requirement import CimOrCpo

from app.api.utils.models_mixins import Base, AuditMixin
from app.api.mines.reports.models.mine_report_definition_compliance_article_xref import \
    MineReportDefinitionComplianceArticleXref
from app.api.mines.reports.models.mine_report_due_date_type import MineReportDueDateType
from app.api.compliance.models.compliance_article import ComplianceArticle
from app.extensions import db


class MineReportDefinition(Base, AuditMixin):
    __tablename__ = "mine_report_definition"
    mine_report_definition_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    mine_report_definition_guid = db.Column(UUID(as_uuid=True), nullable=False, default=uuid.uuid4())
    report_name = db.Column(db.String, nullable=False, unique=True)
    description = db.Column(db.String, nullable=False)
    due_date_period_months = db.Column(db.Integer, nullable=False)
    mine_report_due_date_type = db.Column(
        db.String,
        db.ForeignKey(MineReportDueDateType.mine_report_due_date_type),
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
        secondary='mine_report_definition_compliance_article_xref',
        backref='reports'
    )

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
    def create(cls,
               report_name,
               description,
               mine_report_due_date_type_code,
               due_date_period_months,
               report_type,
               is_common):
        mine_report_due_date_type: MineReportDueDateType = MineReportDueDateType.find_by_mine_report_due_date_type(
            mine_report_due_date_type_code)

        if not mine_report_due_date_type:
            raise Exception('Mine Report Due Date Type not found.')

        # Check if a report with the same name already exists
        existing_report = cls.query.filter_by(report_name=report_name).first()
        if existing_report:
            raise Exception(f"A report with the name '{report_name}' already exists.")

        is_prr_only = True if report_type == 'PRR' else False

        mine_report_definition = cls(report_name=report_name,
                                     description=description,
                                     mine_report_due_date_type=mine_report_due_date_type.mine_report_due_date_type,
                                     due_date_period_months=due_date_period_months,
                                     is_prr_only=is_prr_only,
                                     is_common=is_common)
        mine_report_definition.save(commit=True)
        return mine_report_definition

    @classmethod
    def find_by_mine_report_definition_id(cls, _id):
        try:
            return cls.query.filter_by(mine_report_definition_id=_id).first()
        except ValueError:
            return None

    @classmethod
    def find_by_mine_report_definition_many(cls, _guids):
        try:
            return cls.query.filter(cls.mine_report_definition_guid.in_(_guids)).all()
        except ValueError:
            return None

    @classmethod
    def find_by_mine_report_definition_guid(cls, _id):
        try:
            return cls.query.filter_by(mine_report_definition_guid=_id).first()
        except ValueError:
            return None

    @classmethod
    def _apply_sort(cls, query, sort_field, sort_dir):
        if sort_field and sort_dir:
            field = {
                'report_name': [MineReportDefinition.report_name],
                'section': [cast(ComplianceArticle.section, Integer), cast(ComplianceArticle.sub_section, Integer),
                            cast(ComplianceArticle.paragraph, Integer), ComplianceArticle.sub_paragraph],
                'regulatory_authority': [ComplianceArticle.cim_or_cpo]
            }
            sort_func = field[sort_field]
            if sort_dir == 'desc':
                sort_func = [field.desc() for field in sort_func]
            # sort section asc with nulls first because linguistically we want section 1 before 1.1 but we don't want None before CPO
            if sort_field == 'section':
                nullfunc = nullsfirst if sort_dir == 'asc' else nullslast
                sort_func = [nullfunc(field) for field in sort_func]
            query = query.order_by(*sort_func)

        return query

    @classmethod
    def _apply_filters(cls, query, regulatory_authority, is_prr_only, active_ind, section):
        filters = []
        if regulatory_authority:
            reg_auth_filter = []
            if "NONE" in regulatory_authority:
                regulatory_authority.remove("NONE")
                reg_auth_filter.append(ComplianceArticle.cim_or_cpo.is_(None))
            if len(regulatory_authority) > 0:
                reg_auth_filter.append(ComplianceArticle.cim_or_cpo.in_(regulatory_authority))

            # if the query is either reg_auth = None or reg_auth in (list)
            if len(reg_auth_filter) == 1:
                reg_auth_filter = reg_auth_filter[0]

            # ex: query is reg auth in [None, CIM]
            else:
                reg_auth_filter = or_(*reg_auth_filter)
            filters.append(reg_auth_filter)
        # only filter if there is one value for is_prr
        if len(is_prr_only) == 1:
            is_prr_value = True if is_prr_only[0] == "true" else False
            filters.append(MineReportDefinition.is_prr_only.is_(is_prr_value))
        # filter active index unless value is [true, false]
        if len(active_ind) < 2:
            active_filter_value = True if "false" not in active_ind else False
            filters.append(MineReportDefinition.active_ind.is_(active_filter_value))

        if section:
            section_parts = section.split(".")
            section_order = [
                ComplianceArticle.section,
                ComplianceArticle.sub_section,
                ComplianceArticle.paragraph,
                ComplianceArticle.sub_paragraph]

            for index, part in enumerate(section_parts):
                field_name = section_order[index]
                filters.append(field_name.ilike(part))

        return query.filter(*filters)

    @classmethod
    def _apply_pagination(cls, query, page, per_page):
        if per_page != 0:
            records, pagination_details = apply_pagination(query, page, per_page)
            return {
                'records': records.all(),
                'current_page': pagination_details.page_number,
                'total_pages': pagination_details.num_pages,
                'items_per_page': pagination_details.page_size,
                'total': pagination_details.total_results,
            }
        return {
            'records': query.all(),
            'current_page': 1,
            'total_pages': 1,
            'items_per_page': query.count(),
            'total': query.count(),
        }

    @classmethod
    def apply_filters_and_pagination(cls, query, page, per_page, sort_field, sort_dir, regulatory_authority,
                                     is_prr_only, active_ind, section):

        regulatory_authority = None if len(regulatory_authority) == 0 or len(regulatory_authority) == len(
            CimOrCpo) + 1 else regulatory_authority

        compliance_sort = True if sort_field in ['section', 'regulatory_authority'] else False
        compliance_filter = True if regulatory_authority or section else False

        if compliance_sort or compliance_filter:
            query = query.join(MineReportDefinitionComplianceArticleXref,
                               MineReportDefinitionComplianceArticleXref.mine_report_definition_id == MineReportDefinition.mine_report_definition_id)
            query = query.join(ComplianceArticle,
                               ComplianceArticle.compliance_article_id == MineReportDefinitionComplianceArticleXref.compliance_article_id)

        query = cls._apply_sort(query, sort_field, sort_dir)
        query = cls._apply_filters(query, regulatory_authority, is_prr_only, active_ind, section)
        return cls._apply_pagination(query, page, per_page)

    @classmethod
    def get_all(cls):
        return cls.query.all()

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
        if current_date < fiscal_year_end:  # Jan - Mar
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

from datetime import datetime, timedelta
import uuid, pytest

from app.api.mines.reports.models.mine_report_definition import MineReportDefinition, _calculate_due_date
from tests.factories import MineFactory, MineReportFactory, RandomMineReportDefinitionWithDueDate


def test_mine_report_definition_model_due_date_function():
    rand_due_date_report = MineReportDefinition(due_date_period_months=12,
                                                mine_report_due_date_type='FIS')
    #it calls this computation function
    assert rand_due_date_report.default_due_date == _calculate_due_date(
        datetime.now(), rand_due_date_report.mine_report_due_date_type,
        rand_due_date_report.due_date_period_months)


def test_mine_report_definition_model_due_date_same_year():
    assert _calculate_due_date(datetime(2000, 1, 1), 'FIS', 12) == datetime(2000, 3, 31)


def test_mine_report_definition_model_due_date_next_year():
    assert _calculate_due_date(datetime(2000, 6, 1), 'FIS', 12) == datetime(2001, 3, 31)

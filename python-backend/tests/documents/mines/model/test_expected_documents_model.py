import json
from app.api.documents.mines.models.expected_documents import MineExpectedDocument
from datetime import datetime
from dateutil.relativedelta import relativedelta

def test_add_fiscal_due_date_with_one_year_period(test_client, auth_headers):
    current_date = datetime.now()
    expected_due_date = datetime(current_date.year +1, 3, 31, 00, 00, 00)
    due_date_type = "FIS"
    period = "12"

    due_date = MineExpectedDocument.add_due_date_to_expected_document(None, current_date, due_date_type, period)

    assert due_date == expected_due_date

def test_add_aniversary_due_date(test_client, auth_headers):
    current_date = datetime.now()
    expected_due_date = current_date
    due_date_type = "ANV"
    period = "12"

    due_date = MineExpectedDocument.add_due_date_to_expected_document(None, current_date, due_date_type, period)

    assert expected_due_date == due_date

def test_add_fiscal_due_date_when_current_date_is_fiscal(test_client, auth_headers):
    fiscal = datetime(datetime.now().year, 3, 31, 00, 00, 00)
    due_date_type = "FIS"
    period = "12"
    expected_due_date = fiscal + relativedelta(months=12)

    due_date = MineExpectedDocument.add_due_date_to_expected_document(None, fiscal, due_date_type, period)

    assert due_date == expected_due_date
    
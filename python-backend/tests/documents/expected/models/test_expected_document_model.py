import uuid
from tests.constants import TEST_MINE_GUID, TEST_EXPECTED_DOCUMENT_GUID1
from app.api.documents.expected.models.document import ExpectedDocument
from datetime import datetime
from dateutil.relativedelta import relativedelta

def test_expected_documents_find_by_exp_document_guid(test_client, auth_headers):
    expected_document = ExpectedDocument.find_by_exp_document_guid(TEST_EXPECTED_DOCUMENT_GUID1)
    assert str(expected_document.exp_document_guid) == TEST_EXPECTED_DOCUMENT_GUID1

def test_add_fiscal_due_date_with_one_year_period(test_client):
    current_date = datetime.now()
    expected_due_date = datetime(current_date.year +1, 3, 31, 00, 00, 00)
    due_date_type = 'FIS'
    period = '12'

    due_date = ExpectedDocument.add_due_date_to_expected_document(None, current_date, due_date_type, period)

    assert due_date == expected_due_date

def test_add_fiscal_due_date_with_five_year_period(test_client):
    current_date = datetime.now()
    expected_due_date = datetime(current_date.year +1, 3, 31, 00, 00, 00)
    due_date_type = 'FIS'
    period = '60'

    due_date = ExpectedDocument.add_due_date_to_expected_document(None, current_date, due_date_type, period)

    assert due_date == expected_due_date

def test_add_aniversary_due_date(test_client):
    current_date = datetime.now()
    expected_due_date = current_date
    due_date_type = 'ANV'
    period = '12'

    due_date = ExpectedDocument.add_due_date_to_expected_document(None, current_date, due_date_type, period)

    assert expected_due_date == due_date

def test_add_fiscal_due_date_when_current_date_is_fiscal(test_client):
    fiscal = datetime(datetime.now().year, 3, 31, 00, 00, 00)
    due_date_type = 'FIS'
    period = '12'
    expected_due_date = fiscal + relativedelta(months=12)

    due_date = ExpectedDocument.add_due_date_to_expected_document(None, fiscal, due_date_type, period)

    assert due_date == expected_due_date

def test_add_fiscal_due_date_on_year_end(test_client):
    end_of_year = datetime(datetime.now().year - 1, 12, 31, 23, 59, 59)
    due_date_type = 'FIS'
    period = '12'
    expected_due_date = datetime(datetime.now().year, 3, 31, 00, 00, 00)

    due_date = ExpectedDocument.add_due_date_to_expected_document(None, end_of_year, due_date_type, period)

    assert due_date == expected_due_date

def test_add_fiscal_due_date_on_new_year(test_client):
    new_year = datetime(datetime.now().year, 1, 1, 00, 00, 00)
    due_date_type = 'FIS'
    period = '12'
    expected_due_date = datetime(datetime.now().year+1, 3, 31, 00, 00, 00)

    due_date = ExpectedDocument.add_due_date_to_expected_document(None, new_year, due_date_type, period)

    assert due_date == expected_due_date

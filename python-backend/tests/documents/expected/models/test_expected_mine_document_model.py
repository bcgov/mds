import uuid
from tests.constants import TEST_MINE_GUID, TEST_EXPECTED_DOCUMENT_GUID1, TEST_EXPECTED_DOCUMENT_GUID2, TEST_EXPECTED_DOCUMENT_NAME2, TEST_EXPECTED_DOCUMENT_STATUS_CODE1, DUMMY_USER_KWARGS
from app.api.documents.expected.models.mine_expected_document import MineExpectedDocument
from datetime import datetime
from dateutil.relativedelta import relativedelta


# MineExpectedDocument Class Methods
def test_expected_documents_find_by_mine_guid(test_client):
    expected_documents = MineExpectedDocument.find_by_mine_guid(TEST_MINE_GUID)
    assert all(str(ed.mine_guid) == TEST_MINE_GUID for ed in expected_documents)


def test_expected_documents_find_by_mine_guid_after_insert(test_client):
    org_expected_documents = MineExpectedDocument.find_by_mine_guid(TEST_MINE_GUID)

    expected_document2 = MineExpectedDocument(
        exp_document_guid=uuid.UUID(TEST_EXPECTED_DOCUMENT_GUID2),
        mine_guid=uuid.UUID(TEST_MINE_GUID),
        exp_document_name=TEST_EXPECTED_DOCUMENT_NAME2,
        exp_document_status_code=TEST_EXPECTED_DOCUMENT_STATUS_CODE1,
        **DUMMY_USER_KWARGS)
    expected_document2.save()

    new_expected_documents = MineExpectedDocument.find_by_mine_guid(TEST_MINE_GUID)

    assert len(new_expected_documents) == (len(org_expected_documents) + 1)
    assert all(str(ned.mine_guid) == TEST_MINE_GUID for ned in new_expected_documents)
    assert all(str(oed.mine_guid) == TEST_MINE_GUID for oed in org_expected_documents)


def test_expected_documents_find_by_exp_document_guid(test_client):
    expected_document = MineExpectedDocument.find_by_exp_document_guid(TEST_EXPECTED_DOCUMENT_GUID1)
    assert str(expected_document.exp_document_guid) == TEST_EXPECTED_DOCUMENT_GUID1


#add_due_date tests
def test_add_fiscal_due_date_with_one_year_period(test_client):
    current_date = datetime(datetime.now().year, 7, 1, 00, 00, 00)
    expected_due_date = datetime(current_date.year + 1, 3, 31, 00, 00, 00)
    due_date_type = 'FIS'
    period = '12'

    due_date = MineExpectedDocument._add_due_date_to_expected_document(
        None, current_date, due_date_type, period)

    assert due_date == expected_due_date


def test_add_fiscal_due_date_with_five_year_period(test_client):
    current_date = datetime(datetime.now().year, 7, 1, 00, 00, 00)
    expected_due_date = datetime(current_date.year + 5, 3, 31, 00, 00, 00)
    due_date_type = 'FIS'
    period = '60'

    due_date = MineExpectedDocument._add_due_date_to_expected_document(
        None, current_date, due_date_type, period)

    assert due_date == expected_due_date


def test_add_fiscal_due_date_with_five_year_period_this_year(test_client):
    current_date = datetime(datetime.now().year, 2, 1, 00, 00, 00)
    expected_due_date = datetime(current_date.year + 4, 3, 31, 00, 00, 00)
    due_date_type = 'FIS'
    period = '60'

    due_date = MineExpectedDocument._add_due_date_to_expected_document(
        None, current_date, due_date_type, period)

    assert due_date == expected_due_date


def test_add_aniversary_due_date(test_client):
    current_date = datetime.now()
    expected_due_date = current_date
    due_date_type = 'ANV'
    period = '12'

    due_date = MineExpectedDocument._add_due_date_to_expected_document(
        None, current_date, due_date_type, period)

    assert expected_due_date == due_date


def test_add_fiscal_due_date_when_current_date_is_fiscal(test_client):
    fiscal = datetime(datetime.now().year, 3, 31, 00, 00, 00)
    due_date_type = 'FIS'
    period = '12'
    expected_due_date = fiscal + relativedelta(months=12)

    due_date = MineExpectedDocument._add_due_date_to_expected_document(
        None, fiscal, due_date_type, period)

    assert due_date == expected_due_date


def test_add_fiscal_due_date_on_year_end(test_client):
    end_of_year = datetime(datetime.now().year - 1, 12, 31, 23, 59, 59)
    due_date_type = 'FIS'
    period = '12'
    expected_due_date = datetime(datetime.now().year, 3, 31, 00, 00, 00)

    due_date = MineExpectedDocument._add_due_date_to_expected_document(
        None, end_of_year, due_date_type, period)

    assert due_date == expected_due_date


def test_add_fiscal_due_date_on_new_year(test_client):
    new_year = datetime(datetime.now().year, 1, 1, 00, 00, 00)
    due_date_type = 'FIS'
    period = '12'
    expected_due_date = datetime(datetime.now().year, 3, 31, 00, 00, 00)

    due_date = MineExpectedDocument._add_due_date_to_expected_document(
        None, new_year, due_date_type, period)

    assert due_date == expected_due_date

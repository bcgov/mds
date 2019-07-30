import uuid
from datetime import datetime
from dateutil.relativedelta import relativedelta

from app.api.mines.documents.expected.models.mine_expected_document import MineExpectedDocument
from tests.factories import MineFactory, MineExpectedDocumentFactory

BATCH_SIZE = 5


# MineExpectedDocument Class Methods
def test_expected_documents_find_by_mine_guid(db_session):
    mine_guid = MineFactory(mine_expected_documents=BATCH_SIZE).mine_guid

    expected_documents = MineExpectedDocument.find_by_mine_guid(str(mine_guid))
    assert len(expected_documents) == BATCH_SIZE
    assert all(mine_guid == ed.mine_guid for ed in expected_documents)


def test_expected_documents_find_by_mine_guid_after_insert(db_session):
    mine = MineFactory(mine_expected_documents=BATCH_SIZE)
    mine_guid = mine.mine_guid
    org_expected_documents = MineExpectedDocument.find_by_mine_guid(str(mine_guid))

    MineExpectedDocumentFactory(mine=mine)
    new_expected_documents = MineExpectedDocument.find_by_mine_guid(str(mine_guid))

    assert len(new_expected_documents) == BATCH_SIZE + 1
    assert all(mine_guid == ned.mine_guid for ned in new_expected_documents)
    assert all(mine_guid == oed.mine_guid for oed in org_expected_documents)


def test_expected_documents_find_by_exp_document_guid(db_session):
    exp_doc = MineExpectedDocumentFactory.create_batch(size=BATCH_SIZE)[0]

    expected_document = MineExpectedDocument.find_by_exp_document_guid(
        str(exp_doc.exp_document_guid))
    assert expected_document.exp_document_guid == exp_doc.exp_document_guid


#add_due_date tests
def test_add_fiscal_due_date_with_one_year_period():
    current_date = datetime(datetime.now().year, 7, 1, 00, 00, 00)
    expected_due_date = datetime(current_date.year + 1, 3, 31, 00, 00, 00)
    due_date_type = 'FIS'
    period = '12'

    due_date = MineExpectedDocument._get_due_date_for_expected_document(
        None, current_date, due_date_type, period)

    assert due_date == expected_due_date


def test_add_fiscal_due_date_with_five_year_period():
    current_date = datetime(datetime.now().year, 7, 1, 00, 00, 00)
    expected_due_date = datetime(current_date.year + 5, 3, 31, 00, 00, 00)
    due_date_type = 'FIS'
    period = '60'

    due_date = MineExpectedDocument._get_due_date_for_expected_document(
        None, current_date, due_date_type, period)

    assert due_date == expected_due_date


def test_add_fiscal_due_date_with_five_year_period_this_year():
    current_date = datetime(datetime.now().year, 2, 1, 00, 00, 00)
    expected_due_date = datetime(current_date.year + 4, 3, 31, 00, 00, 00)
    due_date_type = 'FIS'
    period = '60'

    due_date = MineExpectedDocument._get_due_date_for_expected_document(
        None, current_date, due_date_type, period)

    assert due_date == expected_due_date


def test_add_aniversary_due_date():
    current_date = datetime.now()
    expected_due_date = current_date
    due_date_type = 'ANV'
    period = '12'

    due_date = MineExpectedDocument._get_due_date_for_expected_document(
        None, current_date, due_date_type, period)

    assert expected_due_date == due_date


def test_add_fiscal_due_date_when_current_date_is_fiscal():
    fiscal = datetime(datetime.now().year, 3, 31, 00, 00, 00)
    due_date_type = 'FIS'
    period = '12'
    expected_due_date = fiscal + relativedelta(months=12)

    due_date = MineExpectedDocument._get_due_date_for_expected_document(
        None, fiscal, due_date_type, period)

    assert due_date == expected_due_date


def test_add_fiscal_due_date_on_year_end():
    end_of_year = datetime(datetime.now().year - 1, 12, 31, 23, 59, 59)
    due_date_type = 'FIS'
    period = '12'
    expected_due_date = datetime(datetime.now().year, 3, 31, 00, 00, 00)

    due_date = MineExpectedDocument._get_due_date_for_expected_document(
        None, end_of_year, due_date_type, period)

    assert due_date == expected_due_date


def test_add_fiscal_due_date_on_new_year():
    new_year = datetime(datetime.now().year, 1, 1, 00, 00, 00)
    due_date_type = 'FIS'
    period = '12'
    expected_due_date = datetime(datetime.now().year, 3, 31, 00, 00, 00)

    due_date = MineExpectedDocument._get_due_date_for_expected_document(
        None, new_year, due_date_type, period)

    assert due_date == expected_due_date

import pytest
from unittest import mock
from app.api.mines.permits.permit_conditions.tasks import export_and_index_permit_amendments

@pytest.fixture
def export_permit_conditions_mock():
    with mock.patch('app.api.mines.permits.permit_conditions.tasks.export_permit_conditions') as m:
        yield m

@pytest.fixture
def permit_search_service_mock():
    with mock.patch('app.api.mines.permits.permit_conditions.tasks.PermitSearchService') as m:
        yield m

@pytest.fixture
def permit_amendment_mock():
    with mock.patch('app.api.mines.permits.permit_amendment.models.permit_amendment.PermitAmendment.find_by_permit_amendment_guid') as mc:
        yield mc

def test_export_and_index_single_permit_amendment_success(export_permit_conditions_mock, permit_search_service_mock, permit_amendment_mock, db_session):
    permit_amendment_guid = 'test-guid'
    amendment_mock = mock.Mock()
    amendment_mock.conditions = []
    permit_amendment_mock.return_value = amendment_mock
    export_permit_conditions_mock.return_value = [{'header': 'row'}]
    mock_index = permit_search_service_mock.return_value.index

    export_and_index_permit_amendments([permit_amendment_guid])
    
    export_permit_conditions_mock.assert_called_once()
    mock_index.assert_called_once()
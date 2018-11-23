import uuid
from tests.constants import TEST_MINE_GUID, TEST_EXPECTED_DOCUMENT_GUID1
from app.api.documents.expected.models.document import ExpectedDocument

def test_expected_documents_find_by_exp_document_guid(test_client, auth_headers):
    expected_document = ExpectedDocument.find_by_exp_document_guid(TEST_EXPECTED_DOCUMENT_GUID1)
    assert str(expected_document.exp_document_guid) == TEST_EXPECTED_DOCUMENT_GUID1

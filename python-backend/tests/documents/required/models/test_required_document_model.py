from tests.constants import TEST_REQUIRED_REPORT_GUID1, TEST_REQUIRED_REPORT_CATEGORY_TAILINGS
from app.api.documents.required.models.required_documents import RequiredDocument


# RequiredDocument Class Methods
def test_required_documents_find_by_req_doc_guid(test_client, auth_headers):
    required_document = RequiredDocument.find_by_req_doc_guid(TEST_REQUIRED_REPORT_GUID1)
    assert str(required_document.req_document_guid) == TEST_REQUIRED_REPORT_GUID1

def test_required_documents_find_by_req_doc_category(test_client, auth_headers):
    required_documents = RequiredDocument.find_by_req_doc_category(TEST_REQUIRED_REPORT_CATEGORY_TAILINGS)
    assert len(required_documents) == 2
    assert all(rd.req_document_category.req_document_category == TEST_REQUIRED_REPORT_CATEGORY_TAILINGS for rd in required_documents)
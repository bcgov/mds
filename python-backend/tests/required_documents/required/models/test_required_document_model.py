import pytest
from tests.status_code_gen import RandomRequiredDocument
from app.api.required_documents.models.required_documents import RequiredDocument


# RequiredDocument Class Methods
def test_required_documents_find_by_req_doc_guid(db_session, auth_headers):
    req = RandomRequiredDocument()

    required_document = RequiredDocument.find_by_req_doc_guid(str(req.req_document_guid))
    assert required_document == req


def test_required_documents_find_by_req_doc_category(db_session, auth_headers):
    required_documents = RequiredDocument.find_by_req_doc_category('TSF')
    assert len(required_documents) > 0
    assert all(rd.req_document_category == 'TSF' for rd in required_documents)

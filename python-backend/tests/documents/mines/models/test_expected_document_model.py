import uuid
from tests.constants import TEST_MINE_GUID, TEST_EXPECTED_DOCUMENT_GUID2, TEST_EXPECTED_DOCUMENT_NAME2, DUMMY_USER_KWARGS
from app.api.documents.mines.models.expected_documents import MineExpectedDocument

# MineExpectedDocument Class Methods
def test_expected_documents_find_by_mine_guid(test_client, auth_headers):
    expected_documents = MineExpectedDocument.find_by_mine_guid(TEST_MINE_GUID)
    assert all(str(ed.mine_guid) == TEST_MINE_GUID for ed in expected_documents)


def test_expected_documents_find_by_mine_guid_after_insert(test_client, auth_headers):
    org_expected_documents = MineExpectedDocument.find_by_mine_guid(TEST_MINE_GUID)

    expected_document2 = MineExpectedDocument(
        exp_document_guid = uuid.UUID(TEST_EXPECTED_DOCUMENT_GUID2),
        mine_guid = uuid.UUID(TEST_MINE_GUID),
        exp_document_name = TEST_EXPECTED_DOCUMENT_NAME2,
        **DUMMY_USER_KWARGS
    )
    expected_document2.save()
    
    new_expected_documents = MineExpectedDocument.find_by_mine_guid(TEST_MINE_GUID)
    
    assert len(new_expected_documents) == (len(org_expected_documents) + 1)
    assert all(str(ned.mine_guid) == TEST_MINE_GUID for ned in new_expected_documents)
    assert all(str(oed.mine_guid) == TEST_MINE_GUID for oed in org_expected_documents)
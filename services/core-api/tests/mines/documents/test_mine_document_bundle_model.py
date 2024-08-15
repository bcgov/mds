import uuid

from app.api.mines.documents.models.mine_document_bundle import MineDocumentBundle
from tests.factories import MineDocumentBundleFactory


def test_find_by_bundle_id(db_session):
    mine_document_bundle = MineDocumentBundleFactory()
    bundle_id = mine_document_bundle.bundle_id
    mine_document_bundle = MineDocumentBundle.find_by_bundle_id(bundle_id)
    assert mine_document_bundle.bundle_id == bundle_id


def test_find_by_docman_bundle_guid(db_session):
    mine_document_bundle = MineDocumentBundleFactory()
    docman_bundle_guid = mine_document_bundle.docman_bundle_guid
    mine_document_bundle = MineDocumentBundle.find_by_docman_bundle_guid(docman_bundle_guid)
    assert mine_document_bundle.docman_bundle_guid == docman_bundle_guid


def test_update_spatial_mine_document_with_bundle_id(db_session):
    documents = [
        {
            'docman_bundle_guid': uuid.uuid4(),
            'document_name': 'testname',
            'geomark_id': '1234',
        },
        {
            'docman_bundle_guid': uuid.uuid4(),
            'document_name': 'testname',
            'geomark_id': '1234',
        },
    ]

    updated_spatial_docs = MineDocumentBundle.update_spatial_mine_document_with_bundle_id(documents)

    # Assert that the spatial documents have been updated as expected
    for doc in updated_spatial_docs:
        assert doc.get('mine_document_bundle_id') is not None
from app.api.now_applications.models.now_application import NOWApplication
from app.api.now_applications.models.now_application_document_xref import (
    NOWApplicationDocumentXref,
)
from tests.factories import MineDocumentFactory, MineDocumentSpatialFactory
from tests.now_application_factories import NOWApplicationFactory, NOWApplicationIdentityFactory


def _add_document(db_session, now_application, mine_document):
    xref = NOWApplicationDocumentXref(
        now_application_id=now_application.now_application_id,
        mine_document=mine_document,
        now_application_document_type_code='OTH')
    now_application.documents.append(xref)
    db_session.flush()
    return xref


class TestGetSpatialDocumentBundles:
    """NOWApplication.get_spatial_document_bundles"""

    def test_includes_manually_added_documents(self, test_client, db_session):
        identity = NOWApplicationIdentityFactory(now_application=NOWApplicationFactory())
        now_application = identity.now_application
        mine_document = MineDocumentSpatialFactory(
            mine=identity.mine, document_name='boundary.kml')
        _add_document(db_session, now_application, mine_document)

        bundles = NOWApplication.get_spatial_document_bundles(now_application)

        assert len(bundles) == 1
        assert bundles[0]['bundle_id'] == mine_document.mine_document_bundle.bundle_id

    def test_excludes_documents_without_a_bundle(self, test_client, db_session):
        identity = NOWApplicationIdentityFactory(now_application=NOWApplicationFactory())
        now_application = identity.now_application
        _add_document(db_session, now_application,
                      MineDocumentFactory(mine=identity.mine, document_name='report.pdf'))

        assert NOWApplication.get_spatial_document_bundles(now_application) == []

    def test_deduplicates_documents_sharing_a_bundle(self, test_client, db_session):
        identity = NOWApplicationIdentityFactory(now_application=NOWApplicationFactory())
        now_application = identity.now_application
        first = MineDocumentSpatialFactory(mine=identity.mine, document_name='boundary.shp')
        second = MineDocumentFactory(mine=identity.mine, document_name='boundary.prj')
        second.mine_document_bundle = first.mine_document_bundle
        _add_document(db_session, now_application, first)
        _add_document(db_session, now_application, second)

        bundles = NOWApplication.get_spatial_document_bundles(now_application)

        assert len(bundles) == 1
        assert len(bundles[0]['bundle_documents']) == 2

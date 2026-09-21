from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from tests.now_application_factories import NOWApplicationIdentityFactory
from tests.factories import MineDocumentFactory


def _make_document_xref(now_application_identity):
    mine_doc = MineDocumentFactory(mine=now_application_identity.mine)
    xref = NOWApplicationDocumentXref(
        now_application_id=now_application_identity.now_application_id,
        mine_document_guid=mine_doc.mine_document_guid,
        now_application_document_type_code='OTH')
    return mine_doc, xref


class TestNOWApplicationDocumentResourcePut:
    """PUT /now-applications/ID/document/MINE_DOCUMENT_ID"""

    def test_put_sets_permit_package_document_type_when_final_package(
            self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_doc, xref = _make_document_xref(now_application_identity)
        db_session.add(xref)
        db_session.commit()

        resp = test_client.put(
            f'/now-applications/{now_application_identity.now_application_guid}/document/{mine_doc.mine_document_guid}',
            json={'is_final_package': True, 'permit_package_document_type_code': 'FIGURE'},
            headers=auth_headers['full_auth_header'])

        assert resp.status_code == 200
        db_session.refresh(xref)
        assert xref.is_final_package is True
        assert xref.permit_package_document_type_code == 'FIGURE'

    def test_put_clears_permit_package_document_type_when_unchecked(
            self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_doc, xref = _make_document_xref(now_application_identity)
        xref.is_final_package = True
        xref.permit_package_document_type_code = 'FIGURE'
        db_session.add(xref)
        db_session.commit()

        resp = test_client.put(
            f'/now-applications/{now_application_identity.now_application_guid}/document/{mine_doc.mine_document_guid}',
            json={'is_final_package': False},
            headers=auth_headers['full_auth_header'])

        assert resp.status_code == 200
        db_session.refresh(xref)
        assert xref.is_final_package is False
        assert xref.permit_package_document_type_code is None

    def test_put_preserves_permit_package_document_type_when_not_supplied(
            self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_doc, xref = _make_document_xref(now_application_identity)
        xref.is_final_package = True
        xref.permit_package_document_type_code = 'FIGURE'
        db_session.add(xref)
        db_session.commit()

        resp = test_client.put(
            f'/now-applications/{now_application_identity.now_application_guid}/document/{mine_doc.mine_document_guid}',
            json={'is_final_package': True, 'description': 'Updated description only'},
            headers=auth_headers['full_auth_header'])

        assert resp.status_code == 200
        db_session.refresh(xref)
        assert xref.description == 'Updated description only'
        assert xref.permit_package_document_type_code == 'FIGURE'

    def test_put_rejects_invalid_permit_package_document_type(
            self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_doc, xref = _make_document_xref(now_application_identity)
        db_session.add(xref)
        db_session.commit()

        resp = test_client.put(
            f'/now-applications/{now_application_identity.now_application_guid}/document/{mine_doc.mine_document_guid}',
            json={'is_final_package': True, 'permit_package_document_type_code': 'NOT_A_REAL_CODE'},
            headers=auth_headers['full_auth_header'])

        # A rejected FK triggers the generic error handler, which tears down the shared test session entirely - we can't query through it further in this test
        # A 400 here is a meaningful assertion (rejected, not silently saved).
        assert resp.status_code == 400

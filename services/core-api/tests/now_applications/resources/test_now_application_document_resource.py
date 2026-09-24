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

    def test_put_assigns_final_package_order_on_first_add(
            self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_doc, xref = _make_document_xref(now_application_identity)
        db_session.add(xref)
        db_session.commit()

        resp = test_client.put(
            f'/now-applications/{now_application_identity.now_application_guid}/document/{mine_doc.mine_document_guid}',
            json={'is_final_package': True, 'permit_package_document_type_code': 'DOCUMENT'},
            headers=auth_headers['full_auth_header'])

        assert resp.status_code == 200
        db_session.refresh(xref)
        # Only document in the package, so it lands at the very first slot.
        assert xref.final_package_order == 1

    def test_put_respects_client_supplied_final_package_order_on_first_add(
            self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_doc, xref = _make_document_xref(now_application_identity)
        db_session.add(xref)
        db_session.commit()

        resp = test_client.put(
            f'/now-applications/{now_application_identity.now_application_guid}/document/{mine_doc.mine_document_guid}',
            json={
                'is_final_package': True,
                'permit_package_document_type_code': 'DOCUMENT',
                'final_package_order': 42,
            },
            headers=auth_headers['full_auth_header'])

        assert resp.status_code == 200
        db_session.refresh(xref)
        assert xref.final_package_order == 42

    def test_put_preserves_final_package_order_on_ordinary_edit(
            self, test_client, db_session, auth_headers):
        """Editing an already-ordered document must not
        reshuffle its position."""
        now_application_identity = NOWApplicationIdentityFactory()
        mine_doc, xref = _make_document_xref(now_application_identity)
        xref.is_final_package = True
        xref.permit_package_document_type_code = 'DOCUMENT'
        xref.final_package_order = 3
        db_session.add(xref)
        db_session.commit()

        resp = test_client.put(
            f'/now-applications/{now_application_identity.now_application_guid}/document/{mine_doc.mine_document_guid}',
            json={
                'is_final_package': True,
                'permit_package_document_type_code': 'DOCUMENT',
                'description': 'Just updating the description',
            },
            headers=auth_headers['full_auth_header'])

        assert resp.status_code == 200
        db_session.refresh(xref)
        assert xref.final_package_order == 3

    def test_put_reassigns_order_on_type_switch(
            self, test_client, db_session, auth_headers):
        """Switching a document from Document to Figure moves it into the Figure
        table's own numbering, landing at the bottom of that table specifically
        rather than just past the highest order value anywhere."""
        now_application_identity = NOWApplicationIdentityFactory()
        # An existing Figure already in the package, to establish the Figure pool's max.
        other_mine_doc, other_xref = _make_document_xref(now_application_identity)
        other_xref.is_final_package = True
        other_xref.permit_package_document_type_code = 'FIGURE'
        other_xref.final_package_order = 1
        db_session.add(other_xref)

        mine_doc, xref = _make_document_xref(now_application_identity)
        xref.is_final_package = True
        xref.permit_package_document_type_code = 'DOCUMENT'
        xref.final_package_order = 5
        db_session.add(xref)
        db_session.commit()

        resp = test_client.put(
            f'/now-applications/{now_application_identity.now_application_guid}/document/{mine_doc.mine_document_guid}',
            json={'is_final_package': True, 'permit_package_document_type_code': 'FIGURE'},
            headers=auth_headers['full_auth_header'])

        assert resp.status_code == 200
        db_session.refresh(xref)
        assert xref.permit_package_document_type_code == 'FIGURE'
        assert xref.final_package_order == 2

    def test_put_does_not_reassign_order_when_type_resent_unchanged(
            self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_doc, xref = _make_document_xref(now_application_identity)
        xref.is_final_package = True
        xref.permit_package_document_type_code = 'FIGURE'
        xref.final_package_order = 5
        db_session.add(xref)
        db_session.commit()

        resp = test_client.put(
            f'/now-applications/{now_application_identity.now_application_guid}/document/{mine_doc.mine_document_guid}',
            json={'is_final_package': True, 'permit_package_document_type_code': 'FIGURE'},
            headers=auth_headers['full_auth_header'])

        assert resp.status_code == 200
        db_session.refresh(xref)
        assert xref.final_package_order == 5

    def test_put_clears_final_package_order_on_removal(
            self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_doc, xref = _make_document_xref(now_application_identity)
        xref.is_final_package = True
        xref.permit_package_document_type_code = 'FIGURE'
        xref.final_package_order = 5
        db_session.add(xref)
        db_session.commit()

        resp = test_client.put(
            f'/now-applications/{now_application_identity.now_application_guid}/document/{mine_doc.mine_document_guid}',
            json={'is_final_package': False},
            headers=auth_headers['full_auth_header'])

        assert resp.status_code == 200
        db_session.refresh(xref)
        assert xref.final_package_order is None

import random
import uuid
from datetime import datetime
from unittest.mock import patch

from flask_restx import marshal

from app.api.mines.documents.models.mine_document_version import MineDocumentVersion
from app.api.now_applications.models.now_application_document_identity_xref import NOWApplicationDocumentIdentityXref
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from app.api.now_applications.response_models import NOW_APPLICATION_MODEL
from tests.factories import MineDocumentFactory
from tests.now_application_factories import NOWApplicationIdentityFactory


def _make_core_document(db_session, now_application_identity, document_name='report.pdf', archived=False, **xref_fields):
    mine_document = MineDocumentFactory(mine=now_application_identity.mine, document_name=document_name)
    xref = NOWApplicationDocumentXref(
        now_application_id=now_application_identity.now_application_id,
        mine_document_guid=mine_document.mine_document_guid,
        now_application_document_type_code='OTH',
        **xref_fields)
    db_session.add(xref)
    if archived:
        _archive(mine_document)
    db_session.commit()
    return mine_document, xref


def _make_imported_document(db_session, now_application_identity, document_name='application.pdf', archived=False,
                            **xref_fields):
    mine_document = MineDocumentFactory(mine=now_application_identity.mine, document_name=document_name)
    xref = NOWApplicationDocumentIdentityXref(
        messageid=random.randint(1, 2_000_000_000),
        documenturl=f'https://vfcbc.example/{uuid.uuid4()}',
        filename=document_name,
        documenttype='Application',
        now_application_id=now_application_identity.now_application_id,
        mine_document=mine_document,
        **xref_fields)
    db_session.add(xref)
    if archived:
        _archive(mine_document)
    db_session.commit()
    return mine_document, xref


PERMIT_PACKAGE_FIELDS = dict(is_final_package=True, final_package_order=1, permit_package_document_type_code='DOCUMENT')
NROS_PATH = 'app.api.now_applications.resources.now_application_resource.NROSNOWStatusService.nros_now_status_update'
IMPORT_DOCS_PATH = 'app.api.now_applications.resources.now_application_resource.DocumentManagerService.importNoticeOfWorkSubmissionDocuments'


def _archive_out_of_package(db_session, mine_document, xref):
    """What the archive endpoint does: remove from the permit package, then archive."""
    xref.is_final_package = False
    xref.final_package_order = None
    xref.permit_package_document_type_code = None
    _archive(mine_document)
    db_session.commit()


def _imported_payload_entry(xref, **fields):
    return {
        'documenturl': xref.documenturl,
        'messageid': xref.messageid,
        'filename': xref.filename,
        'documenttype': xref.documenttype,
        'is_final_package': False,
        'is_consultation_package': False,
        'is_referral_package': False,
        **fields,
    }


def _put_application(test_client, auth_headers, now_application_identity, payload):
    resp = test_client.put(
        f'/now-applications/{now_application_identity.now_application_guid}',
        json=payload,
        headers=auth_headers['full_auth_header'])
    assert resp.status_code == 200, resp.data
    return resp


def _archive(mine_document):
    mine_document.is_archived = True
    mine_document.archived_date = datetime.utcnow()
    mine_document.archived_by = 'test-user'


def _get_application(test_client, auth_headers, now_application_identity):
    resp = test_client.get(
        f'/now-applications/{now_application_identity.now_application_guid}',
        headers=auth_headers['full_auth_header'])
    assert resp.status_code == 200, resp.data
    return resp.json


def _xref_guids(documents):
    return [doc['now_application_document_xref_guid'] for doc in documents]


class TestGetApplicationArchivedDocuments:
    """GET /now-applications/{application_guid} lists archived documents separately"""

    def test_archived_core_document_moves_to_archived_documents(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        _, active_xref = _make_core_document(db_session, now_application_identity, 'active.pdf')
        _, archived_xref = _make_core_document(db_session, now_application_identity, 'archived.pdf', archived=True)

        data = _get_application(test_client, auth_headers, now_application_identity)

        assert _xref_guids(data['documents']) == [str(active_xref.now_application_document_xref_guid)]
        assert _xref_guids(data['archived_documents']) == [str(archived_xref.now_application_document_xref_guid)]
        archived_mine_document = data['archived_documents'][0]['mine_document']
        assert archived_mine_document['is_archived'] is True
        assert archived_mine_document['archived_by'] == 'test-user'
        assert archived_mine_document['archived_date']

    def test_archived_imported_document_moves_to_archived_submission_documents(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        _, active_xref = _make_imported_document(db_session, now_application_identity, 'active.pdf')
        _, archived_xref = _make_imported_document(db_session, now_application_identity, 'archived.pdf', archived=True)

        data = _get_application(test_client, auth_headers, now_application_identity)

        assert str(active_xref.now_application_document_xref_guid) in _xref_guids(data['filtered_submission_documents'])
        assert str(archived_xref.now_application_document_xref_guid) not in _xref_guids(data['filtered_submission_documents'])
        assert _xref_guids(data['archived_submission_documents']) == [str(archived_xref.now_application_document_xref_guid)]
        archived_document = data['archived_submission_documents'][0]
        assert archived_document['is_archived'] is True
        assert archived_document['archived_by'] == 'test-user'
        assert archived_document['archived_date']

    def test_imported_document_includes_versions(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, xref = _make_imported_document(db_session, now_application_identity, 'application.pdf')
        db_session.add(MineDocumentVersion(
            mine_document_guid=mine_document.mine_document_guid,
            document_manager_version_guid=uuid.uuid4(),
            document_name='application-original.pdf'))
        db_session.commit()

        data = _get_application(test_client, auth_headers, now_application_identity)

        document = next(doc for doc in data['filtered_submission_documents']
                        if doc['now_application_document_xref_guid'] == str(xref.now_application_document_xref_guid))
        assert document['is_archived'] is False
        assert [version['document_name'] for version in document['versions']] == ['application-original.pdf']

    def test_no_archived_documents_returns_empty_lists(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        _make_core_document(db_session, now_application_identity)
        _make_imported_document(db_session, now_application_identity)

        data = _get_application(test_client, auth_headers, now_application_identity)

        assert data['archived_documents'] == []
        assert data['archived_submission_documents'] == []


class TestPutApplicationArchivedDocuments:
    """PUT /now-applications/{application_guid} with archived documents missing from the payload"""

    @patch('app.api.now_applications.resources.now_application_resource.NROSNOWStatusService.nros_now_status_update')
    @patch('app.api.now_applications.resources.now_application_resource.DocumentManagerService.importNoticeOfWorkSubmissionDocuments')
    def test_put_without_archived_documents_leaves_them_linked_and_archived(
            self, mock_import_docs, mock_nros, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        _make_core_document(db_session, now_application_identity, 'active.pdf')
        archived_mine_document, archived_xref = _make_core_document(
            db_session, now_application_identity, 'archived.pdf', archived=True)

        # The same payload a freshly loaded page would send: documents comes from active_documents
        payload = marshal(now_application_identity.now_application, NOW_APPLICATION_MODEL)
        assert str(archived_xref.now_application_document_xref_guid) not in _xref_guids(payload['documents'])

        resp = test_client.put(
            f'/now-applications/{now_application_identity.now_application_guid}',
            json=payload,
            headers=auth_headers['full_auth_header'])

        assert resp.status_code == 200, resp.data
        db_session.refresh(archived_xref)
        db_session.refresh(archived_mine_document)
        assert archived_xref.deleted_ind is False
        assert archived_xref.now_application_id == now_application_identity.now_application_id
        assert archived_mine_document.is_archived is True
        assert _xref_guids(resp.json['archived_documents']) == [str(archived_xref.now_application_document_xref_guid)]


class TestPutStaleArchivedDocuments:
    """PUT /now-applications/{application_guid} from a page loaded before a document was archived"""

    @patch(NROS_PATH)
    @patch(IMPORT_DOCS_PATH)
    def test_stale_save_cannot_put_archived_document_back_in_permit_package(
            self, mock_import_docs, mock_nros, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, xref = _make_core_document(db_session, now_application_identity, **PERMIT_PACKAGE_FIELDS)
        stale_payload = marshal(now_application_identity.now_application, NOW_APPLICATION_MODEL)
        assert str(xref.now_application_document_xref_guid) in _xref_guids(stale_payload['documents'])
        _archive_out_of_package(db_session, mine_document, xref)

        _put_application(test_client, auth_headers, now_application_identity, stale_payload)

        db_session.refresh(xref)
        db_session.refresh(mine_document)
        assert xref.is_final_package is False
        assert xref.final_package_order is None
        assert xref.permit_package_document_type_code is None
        assert mine_document.is_archived is True

    @patch(NROS_PATH)
    @patch(IMPORT_DOCS_PATH)
    def test_stale_save_cannot_put_archived_imported_document_back_in_permit_package(
            self, mock_import_docs, mock_nros, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, xref = _make_imported_document(db_session, now_application_identity, **PERMIT_PACKAGE_FIELDS)
        stale_payload = marshal(now_application_identity.now_application, NOW_APPLICATION_MODEL)
        stale_payload['filtered_submission_documents'] = [_imported_payload_entry(xref, is_final_package=True)]
        _archive_out_of_package(db_session, mine_document, xref)

        _put_application(test_client, auth_headers, now_application_identity, stale_payload)

        db_session.refresh(xref)
        assert xref.is_final_package is False
        assert xref.final_package_order is None

    @patch(NROS_PATH)
    @patch(IMPORT_DOCS_PATH)
    def test_save_still_updates_documents_that_are_not_archived(
            self, mock_import_docs, mock_nros, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        _, core_xref = _make_core_document(db_session, now_application_identity, 'active.pdf')
        _, imported_xref = _make_imported_document(db_session, now_application_identity, 'imported.pdf')
        archived_mine_document, archived_xref = _make_core_document(
            db_session, now_application_identity, 'archived.pdf', archived=True)
        payload = marshal(now_application_identity.now_application, NOW_APPLICATION_MODEL)
        core_entry = next(doc for doc in payload['documents']
                          if doc['now_application_document_xref_guid'] == str(core_xref.now_application_document_xref_guid))
        core_entry['is_final_package'] = True
        payload['filtered_submission_documents'] = [_imported_payload_entry(imported_xref, is_final_package=True)]

        _put_application(test_client, auth_headers, now_application_identity, payload)

        db_session.refresh(core_xref)
        db_session.refresh(imported_xref)
        db_session.refresh(archived_xref)
        assert core_xref.is_final_package is True
        assert core_xref.final_package_order is not None
        assert imported_xref.is_final_package is True
        assert not archived_xref.is_final_package

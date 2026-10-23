import random
import uuid

import pytest

from app.api.now_applications.models.now_application_document_identity_xref import NOWApplicationDocumentIdentityXref
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from tests.factories import MineDocumentFactory
from tests.now_application_factories import NOWApplicationIdentityFactory

NOW_DOCUMENT_ERROR = 'Notice of Work documents can only be replaced or archived from the Notice of Work.'


def _make_core_document(db_session, now_application_identity, **xref_fields):
    mine_document = MineDocumentFactory(mine=now_application_identity.mine)
    xref = NOWApplicationDocumentXref(
        now_application_id=now_application_identity.now_application_id,
        mine_document_guid=mine_document.mine_document_guid,
        now_application_document_type_code='OTH',
        **xref_fields)
    db_session.add(xref)
    db_session.commit()
    return mine_document


def _make_imported_document(db_session, now_application_identity):
    mine_document = MineDocumentFactory(mine=now_application_identity.mine)
    xref = NOWApplicationDocumentIdentityXref(
        messageid=random.randint(1, 2_000_000_000),
        documenturl=f'https://vfcbc.example/{uuid.uuid4()}',
        filename=mine_document.document_name,
        documenttype='Application',
        now_application_id=now_application_identity.now_application_id,
        mine_document=mine_document)
    db_session.add(xref)
    db_session.commit()
    return mine_document


def _archive(test_client, auth_headers, mine_document):
    return test_client.patch(
        f'/mines/{mine_document.mine_guid}/documents/archive',
        headers=auth_headers['full_auth_header'],
        json={'mine_document_guids': [str(mine_document.mine_document_guid)]})


def _start_upload(test_client, auth_headers, mine_document):
    return test_client.post(
        f'/mines/{mine_document.mine_guid}/documents/{mine_document.mine_document_guid}/versions/upload',
        headers=auth_headers['full_auth_header'])


def _record_version(test_client, auth_headers, mine_document):
    return test_client.post(
        f'/mines/{mine_document.mine_guid}/documents/{mine_document.mine_document_guid}/versions',
        headers=auth_headers['full_auth_header'],
        json={'document_manager_version_guid': str(uuid.uuid4())})


MINE_LEVEL_ENDPOINTS = [_archive, _start_upload, _record_version]
NOW_DOCUMENT_MAKERS = [_make_core_document, _make_imported_document]


class TestMineLevelEndpointsRejectNowDocuments:
    """The mine-level archive and replace endpoints don't run the NoW file management rules, so they reject NoW files"""

    @pytest.mark.parametrize('call_endpoint', MINE_LEVEL_ENDPOINTS)
    @pytest.mark.parametrize('make_document', NOW_DOCUMENT_MAKERS)
    def test_rejects_now_document(self, test_client, db_session, auth_headers, call_endpoint, make_document):
        mine_document = make_document(db_session, NOWApplicationIdentityFactory())

        response = call_endpoint(test_client, auth_headers, mine_document)

        assert response.status_code == 400, response.response
        assert NOW_DOCUMENT_ERROR in response.json['message']
        db_session.refresh(mine_document)
        assert not mine_document.is_archived
        assert len(mine_document.versions) == 0

    def test_archive_rejects_whole_request_when_any_document_is_on_a_now(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        now_document = _make_core_document(db_session, now_application_identity)
        mine_document = MineDocumentFactory(mine=now_application_identity.mine)

        response = test_client.patch(
            f'/mines/{mine_document.mine_guid}/documents/archive',
            headers=auth_headers['full_auth_header'],
            json={'mine_document_guids': [str(mine_document.mine_document_guid), str(now_document.mine_document_guid)]})

        assert response.status_code == 400, response.response
        db_session.refresh(mine_document)
        assert not mine_document.is_archived

    def test_allows_document_removed_from_now(self, test_client, db_session, auth_headers):
        mine_document = _make_core_document(db_session, NOWApplicationIdentityFactory(), deleted_ind=True)

        response = _archive(test_client, auth_headers, mine_document)

        assert response.status_code == 204, response.response
        db_session.refresh(mine_document)
        assert mine_document.is_archived

    def test_rejects_document_still_on_now_through_its_other_link(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document = _make_core_document(db_session, now_application_identity, deleted_ind=True)
        db_session.add(NOWApplicationDocumentIdentityXref(
            messageid=random.randint(1, 2_000_000_000),
            documenturl=f'https://vfcbc.example/{uuid.uuid4()}',
            filename=mine_document.document_name,
            documenttype='Application',
            now_application_id=now_application_identity.now_application_id,
            mine_document=mine_document))
        db_session.commit()

        response = _archive(test_client, auth_headers, mine_document)

        assert response.status_code == 400, response.response
        assert NOW_DOCUMENT_ERROR in response.json['message']
        db_session.refresh(mine_document)
        assert not mine_document.is_archived

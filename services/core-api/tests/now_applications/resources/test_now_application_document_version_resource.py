import base64
import random
import uuid
from unittest.mock import patch

import pytest
import responses

from app.api.mines.documents.models.mine_document_version import MineDocumentVersion
from app.api.now_applications.models.now_application_document_identity_xref import NOWApplicationDocumentIdentityXref
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from app.api.services.document_manager_service import DocumentManagerService
from tests.factories import MineDocumentFactory
from tests.now_application_factories import NOWApplicationDelayFactory, NOWApplicationIdentityFactory

FEATURE_FLAG_PATH = 'app.api.now_applications.resources.now_application_document_version_resource.is_feature_enabled'

GOVERNMENT_DOCUMENT_TYPE = 'OTH'
APPLICATION_DOCUMENT_TYPE = 'ANS'
SYSTEM_GENERATED_DOCUMENT_TYPE = 'PMT'
LOCKED_STATUS_CODES = ['AIA', 'REJ', 'WDN', 'NPR']


@pytest.fixture(autouse=True)
def feature_flag():
    with patch(FEATURE_FLAG_PATH, return_value=True) as mock_flag:
        yield mock_flag


def _make_core_document(db_session, now_application_identity, document_type_code=GOVERNMENT_DOCUMENT_TYPE,
                        document_name='report.pdf', **xref_fields):
    mine_document = MineDocumentFactory(mine=now_application_identity.mine, document_name=document_name)
    xref = NOWApplicationDocumentXref(
        now_application_id=now_application_identity.now_application_id,
        mine_document_guid=mine_document.mine_document_guid,
        now_application_document_type_code=document_type_code,
        **xref_fields)
    db_session.add(xref)
    db_session.commit()
    return mine_document, xref


def _make_imported_document(db_session, now_application_identity, document_name='application.pdf', **xref_fields):
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
    db_session.commit()
    return mine_document, xref


def _set_status(db_session, now_application_identity, status_code):
    now_application_identity.now_application.now_application_status_code = status_code
    db_session.commit()


def _start_delay(db_session, now_application_identity):
    NOWApplicationDelayFactory(now_application=now_application_identity, end_date=None)
    db_session.commit()


def _start_upload(test_client, auth_headers, now_application_identity, mine_document, filename='replacement.pdf'):
    headers = dict(auth_headers['full_auth_header'])
    if filename is not None:
        headers['Upload-Metadata'] = f'filename {base64.b64encode(filename.encode()).decode()}'
    return test_client.post(
        f'/now-applications/{now_application_identity.now_application_guid}/document/{mine_document.mine_document_guid}/versions/upload',
        headers=headers)


def _record_version(test_client, auth_headers, now_application_identity, mine_document, version_guid=None):
    return test_client.post(
        f'/now-applications/{now_application_identity.now_application_guid}/document/{mine_document.mine_document_guid}/versions',
        json={'document_manager_version_guid': version_guid or str(uuid.uuid4())},
        headers=auth_headers['full_auth_header'])


def _mock_docman_upload(mine_document):
    responses.add(
        responses.POST,
        f'{DocumentManagerService.document_manager_document_resource_url}/{mine_document.document_manager_guid}/versions',
        json={
            'document_manager_guid': str(mine_document.document_manager_guid),
            'document_manager_version_guid': str(uuid.uuid4())
        })


def _mock_docman_version_lookups(mine_document, version_guid, new_filename):
    base_url = f'{DocumentManagerService.document_manager_document_resource_url}/{mine_document.document_manager_guid}'
    responses.add(responses.GET, f'{base_url}/versions/{version_guid}', json={'file_display_name': mine_document.document_name})
    responses.add(responses.GET, base_url, json={'file_display_name': new_filename})


def _assert_upload_allowed(test_client, auth_headers, now_application_identity, mine_document):
    _mock_docman_upload(mine_document)
    resp = _start_upload(test_client, auth_headers, now_application_identity, mine_document)
    assert resp.status_code == 200, resp.data


def _assert_blocked(test_client, auth_headers, now_application_identity, mine_document, message):
    """Both steps refuse, and the upload never reaches Document Manager (no docman calls are mocked)."""
    upload_resp = _start_upload(test_client, auth_headers, now_application_identity, mine_document)
    assert upload_resp.status_code == 400, upload_resp.data
    assert message in upload_resp.json['message']

    record_resp = _record_version(test_client, auth_headers, now_application_identity, mine_document)
    assert record_resp.status_code == 400, record_resp.data
    assert message in record_resp.json['message']

    assert len(responses.calls) == 0


class TestReplaceKeepsIds:
    """POST /now-applications/{application_guid}/document/{mine_document_guid}/versions never changes the xref GUID that permit conditions reference"""

    @responses.activate
    def test_replace_permit_package_document_keeps_ids(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, xref = _make_core_document(db_session, now_application_identity, is_final_package=True)
        xref_guid = xref.now_application_document_xref_guid
        mine_document_guid = mine_document.mine_document_guid
        document_manager_guid = mine_document.document_manager_guid
        version_guid = str(uuid.uuid4())
        _mock_docman_version_lookups(mine_document, version_guid, 'replacement.pdf')

        resp = _record_version(test_client, auth_headers, now_application_identity, mine_document, version_guid)

        assert resp.status_code == 200, resp.data
        db_session.refresh(xref)
        db_session.refresh(mine_document)
        assert xref.now_application_document_xref_guid == xref_guid
        assert xref.mine_document_guid == mine_document_guid
        assert xref.is_final_package is True
        assert mine_document.mine_document_guid == mine_document_guid
        assert mine_document.document_manager_guid == document_manager_guid
        assert mine_document.document_name == 'replacement.pdf'
        assert NOWApplicationDocumentXref.query.filter_by(
            now_application_id=now_application_identity.now_application_id).count() == 1
        assert MineDocumentVersion.query.filter_by(mine_document_guid=mine_document_guid).count() == 1

    @responses.activate
    def test_replace_imported_document_keeps_ids_and_filename(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, xref = _make_imported_document(db_session, now_application_identity, document_name='application.pdf')
        xref_guid = xref.now_application_document_xref_guid
        mine_document_guid = mine_document.mine_document_guid
        version_guid = str(uuid.uuid4())
        _mock_docman_version_lookups(mine_document, version_guid, 'application-v2.pdf')

        resp = _record_version(test_client, auth_headers, now_application_identity, mine_document, version_guid)

        assert resp.status_code == 200, resp.data
        db_session.refresh(xref)
        db_session.refresh(mine_document)
        assert xref.now_application_document_xref_guid == xref_guid
        assert xref.mine_document_guid == mine_document_guid
        # filename is part of the identity xref's primary key, so it must not change
        assert xref.filename == 'application.pdf'
        assert mine_document.document_name == 'application-v2.pdf'


class TestStartUpload:
    """POST /now-applications/{application_guid}/document/{mine_document_guid}/versions/upload"""

    @responses.activate
    def test_start_upload_returns_docman_version(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity)
        _mock_docman_upload(mine_document)

        resp = _start_upload(test_client, auth_headers, now_application_identity, mine_document)

        assert resp.status_code == 200, resp.data
        assert len(responses.calls) == 1

    @responses.activate
    def test_start_upload_requires_filename(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity)

        resp = _start_upload(test_client, auth_headers, now_application_identity, mine_document, filename=None)

        assert resp.status_code == 400
        assert len(responses.calls) == 0

    @responses.activate
    def test_start_upload_rejects_different_file_type(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity, document_name='report.pdf')

        resp = _start_upload(test_client, auth_headers, now_application_identity, mine_document, filename='report.docx')

        assert resp.status_code == 400
        assert 'same file type' in resp.json['message']
        assert len(responses.calls) == 0

    @pytest.mark.parametrize('document_name', ['site.shp', 'site.shp.xml', 'SITE.KML'])
    @responses.activate
    def test_spatial_files_cannot_be_replaced(self, test_client, db_session, auth_headers, document_name):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity, document_name=document_name)

        _assert_blocked(test_client, auth_headers, now_application_identity, mine_document, 'Spatial files cannot be replaced')

    @responses.activate
    def test_plain_xml_files_can_be_replaced(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity, document_name='metadata.xml')
        _mock_docman_upload(mine_document)

        resp = _start_upload(test_client, auth_headers, now_application_identity, mine_document, filename='metadata-v2.xml')

        assert resp.status_code == 200, resp.data

    def test_flag_off_returns_503(self, test_client, db_session, auth_headers, feature_flag):
        feature_flag.return_value = False
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity)

        upload_resp = _start_upload(test_client, auth_headers, now_application_identity, mine_document)
        record_resp = _record_version(test_client, auth_headers, now_application_identity, mine_document)

        assert upload_resp.status_code == 503
        assert record_resp.status_code == 503

    def test_document_on_another_application_returns_404(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        other_now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, other_now_application_identity)

        upload_resp = _start_upload(test_client, auth_headers, now_application_identity, mine_document)
        record_resp = _record_version(test_client, auth_headers, now_application_identity, mine_document)

        assert upload_resp.status_code == 404
        assert record_resp.status_code == 404

    def test_missing_application_returns_404(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity)

        resp = test_client.post(
            f'/now-applications/{uuid.uuid4()}/document/{mine_document.mine_document_guid}/versions',
            json={'document_manager_version_guid': str(uuid.uuid4())},
            headers=auth_headers['full_auth_header'])

        assert resp.status_code == 404


class TestRecordVersion:
    """POST /now-applications/{application_guid}/document/{mine_document_guid}/versions"""

    @responses.activate
    def test_record_version_rejects_different_file_type(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity, document_name='report.pdf')
        version_guid = str(uuid.uuid4())
        _mock_docman_version_lookups(mine_document, version_guid, 'report.docx')

        resp = _record_version(test_client, auth_headers, now_application_identity, mine_document, version_guid)

        assert resp.status_code == 400
        assert 'same file type' in resp.json['message']
        db_session.refresh(mine_document)
        assert mine_document.document_name == 'report.pdf'
        assert MineDocumentVersion.query.filter_by(mine_document_guid=mine_document.mine_document_guid).count() == 0

    @responses.activate
    def test_record_version_rejects_already_recorded_version(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity, document_name='report.pdf')
        version_guid = str(uuid.uuid4())
        _mock_docman_version_lookups(mine_document, version_guid, 'report-v2.pdf')

        first_resp = _record_version(test_client, auth_headers, now_application_identity, mine_document, version_guid)
        assert first_resp.status_code == 200, first_resp.data
        docman_calls = len(responses.calls)

        resp = _record_version(test_client, auth_headers, now_application_identity, mine_document, version_guid)

        assert resp.status_code == 400
        assert 'already been recorded' in resp.json['message']
        assert MineDocumentVersion.query.filter_by(mine_document_guid=mine_document.mine_document_guid).count() == 1
        assert len(responses.calls) == docman_calls


class TestPermitPackageRules:
    """Replace rules for permit package documents: allowed while in progress, blocked once locked or delayed"""

    @responses.activate
    def test_permit_package_document_can_be_replaced_while_in_progress(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity, is_final_package=True)

        _assert_upload_allowed(test_client, auth_headers, now_application_identity, mine_document)

    @pytest.mark.parametrize('status_code', LOCKED_STATUS_CODES)
    @responses.activate
    def test_permit_package_document_blocked_once_locked(self, test_client, db_session, auth_headers, status_code):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity, is_final_package=True)
        _set_status(db_session, now_application_identity, status_code)

        _assert_blocked(test_client, auth_headers, now_application_identity, mine_document, 'once the application has a decision')

    @responses.activate
    def test_imported_permit_package_document_blocked_once_locked(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_imported_document(db_session, now_application_identity, is_final_package=True)
        _set_status(db_session, now_application_identity, 'AIA')

        _assert_blocked(test_client, auth_headers, now_application_identity, mine_document, 'once the application has a decision')

    @responses.activate
    def test_permit_package_document_blocked_while_delayed(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(
            db_session, now_application_identity, document_type_code=APPLICATION_DOCUMENT_TYPE, is_final_package=True)
        _start_delay(db_session, now_application_identity)

        _assert_blocked(test_client, auth_headers, now_application_identity, mine_document, 'while the application is delayed')


class TestGovernmentDocumentRules:
    """Replace rules for Government documents: allowed once locked, blocked while delayed"""

    @pytest.mark.parametrize('status_code', LOCKED_STATUS_CODES)
    @responses.activate
    def test_government_document_can_be_replaced_once_locked(self, test_client, db_session, auth_headers, status_code):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity)
        _set_status(db_session, now_application_identity, status_code)

        _assert_upload_allowed(test_client, auth_headers, now_application_identity, mine_document)

    @responses.activate
    def test_government_document_blocked_while_delayed(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity)
        _start_delay(db_session, now_application_identity)

        _assert_blocked(test_client, auth_headers, now_application_identity, mine_document, 'while the application is delayed')


class TestApplicationDocumentRules:
    """Replace rules for Application documents, including vFCBC imports: allowed once locked or delayed"""

    @responses.activate
    def test_application_document_can_be_replaced_once_locked_and_delayed(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(
            db_session, now_application_identity, document_type_code=APPLICATION_DOCUMENT_TYPE)
        _set_status(db_session, now_application_identity, 'AIA')
        _start_delay(db_session, now_application_identity)

        _assert_upload_allowed(test_client, auth_headers, now_application_identity, mine_document)

    @responses.activate
    def test_imported_document_can_be_replaced_once_locked_and_delayed(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_imported_document(db_session, now_application_identity)
        _set_status(db_session, now_application_identity, 'AIA')
        _start_delay(db_session, now_application_identity)

        _assert_upload_allowed(test_client, auth_headers, now_application_identity, mine_document)


class TestAlwaysBlocked:
    """Replace rules for documents that can never be replaced from Manage Documents"""

    @responses.activate
    def test_system_generated_document_blocked(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(
            db_session, now_application_identity, document_type_code=SYSTEM_GENERATED_DOCUMENT_TYPE,
            is_system_generated=True)

        _assert_blocked(test_client, auth_headers, now_application_identity, mine_document, 'System-generated')

    @pytest.mark.parametrize('package_field', ['is_referral_package', 'is_consultation_package'])
    @responses.activate
    def test_referral_and_consultation_documents_blocked(self, test_client, db_session, auth_headers, package_field):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity, **{package_field: True})

        _assert_blocked(test_client, auth_headers, now_application_identity, mine_document, 'Referral or Consultation')

    @responses.activate
    def test_referral_document_in_permit_package_blocked_while_in_progress(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(
            db_session, now_application_identity, is_final_package=True, is_referral_package=True)

        _assert_blocked(test_client, auth_headers, now_application_identity, mine_document, 'Referral or Consultation')

    @responses.activate
    def test_imported_consultation_document_blocked(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_imported_document(db_session, now_application_identity, is_consultation_package=True)

        _assert_blocked(test_client, auth_headers, now_application_identity, mine_document, 'Referral or Consultation')

    @responses.activate
    def test_archived_document_blocked(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity)
        mine_document.is_archived = True
        db_session.commit()

        _assert_blocked(test_client, auth_headers, now_application_identity, mine_document, 'archived')

    @responses.activate
    def test_document_outside_manage_documents_tables_blocked(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(
            db_session, now_application_identity, document_type_code=SYSTEM_GENERATED_DOCUMENT_TYPE)

        _assert_blocked(test_client, auth_headers, now_application_identity, mine_document, 'cannot be changed from Manage Documents')

import random
import uuid
from unittest.mock import patch

import pytest

from app.api.now_applications.models.now_application_document_identity_xref import NOWApplicationDocumentIdentityXref
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from tests.factories import MineDocumentFactory
from tests.now_application_factories import NOWApplicationDelayFactory, NOWApplicationIdentityFactory

FEATURE_FLAG_PATH = 'app.api.now_applications.resources.now_application_document_archive_resource.is_feature_enabled'

GOVERNMENT_DOCUMENT_TYPE = 'OTH'
APPLICATION_DOCUMENT_TYPE = 'ANS'
SYSTEM_GENERATED_DOCUMENT_TYPE = 'PMT'
LOCKED_STATUS_CODES = ['AIA', 'REJ', 'WDN', 'NPR']
PERMIT_PACKAGE_FIELDS = dict(is_final_package=True, final_package_order=1, permit_package_document_type_code='DOCUMENT')


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


def _archive(test_client, auth_headers, now_application_identity, mine_documents):
    return test_client.patch(
        f'/now-applications/{now_application_identity.now_application_guid}/documents/archive',
        json={'mine_document_guids': [str(mine_document.mine_document_guid) for mine_document in mine_documents]},
        headers=auth_headers['full_auth_header'])


def _assert_archived(db_session, mine_document):
    db_session.refresh(mine_document)
    assert mine_document.is_archived is True
    assert mine_document.archived_date is not None
    assert mine_document.archived_by


def _assert_not_archived(db_session, mine_document):
    db_session.refresh(mine_document)
    assert mine_document.is_archived is False


def _assert_archive_allowed(test_client, db_session, auth_headers, now_application_identity, mine_document):
    resp = _archive(test_client, auth_headers, now_application_identity, [mine_document])
    assert resp.status_code == 204, resp.data
    _assert_archived(db_session, mine_document)


def _assert_archive_blocked(test_client, db_session, auth_headers, now_application_identity, mine_document, message):
    resp = _archive(test_client, auth_headers, now_application_identity, [mine_document])
    assert resp.status_code == 400, resp.data
    assert message in resp.json['message']
    _assert_not_archived(db_session, mine_document)


class TestArchiveDocuments:
    """PATCH /now-applications/{application_guid}/documents/archive"""

    def test_archive_document(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity)

        _assert_archive_allowed(test_client, db_session, auth_headers, now_application_identity, mine_document)

    def test_archive_removes_document_from_permit_package_and_keeps_xref_guid(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, xref = _make_core_document(db_session, now_application_identity, **PERMIT_PACKAGE_FIELDS)
        xref_guid = xref.now_application_document_xref_guid

        _assert_archive_allowed(test_client, db_session, auth_headers, now_application_identity, mine_document)

        db_session.refresh(xref)
        assert xref.now_application_document_xref_guid == xref_guid
        assert xref.is_final_package is False
        assert xref.final_package_order is None
        assert xref.permit_package_document_type_code is None

    def test_archive_removes_imported_document_from_permit_package(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, xref = _make_imported_document(db_session, now_application_identity, **PERMIT_PACKAGE_FIELDS)

        _assert_archive_allowed(test_client, db_session, auth_headers, now_application_identity, mine_document)

        db_session.refresh(xref)
        assert xref.is_final_package is False
        assert xref.final_package_order is None
        assert xref.permit_package_document_type_code is None

    @pytest.mark.parametrize('document_name', ['site.shp', 'site.shp.xml'])
    def test_spatial_files_can_be_archived(self, test_client, db_session, auth_headers, document_name):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity, document_name=document_name)

        _assert_archive_allowed(test_client, db_session, auth_headers, now_application_identity, mine_document)

    def test_archive_multiple_documents(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        government_document, _ = _make_core_document(db_session, now_application_identity)
        application_document, _ = _make_core_document(
            db_session, now_application_identity, document_type_code=APPLICATION_DOCUMENT_TYPE)
        imported_document, _ = _make_imported_document(db_session, now_application_identity)

        resp = _archive(test_client, auth_headers, now_application_identity,
                        [government_document, application_document, imported_document])

        assert resp.status_code == 204, resp.data
        for mine_document in [government_document, application_document, imported_document]:
            _assert_archived(db_session, mine_document)

    def test_one_blocked_document_archives_nothing(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        package_document, package_xref = _make_core_document(db_session, now_application_identity, **PERMIT_PACKAGE_FIELDS)
        blocked_document, _ = _make_core_document(
            db_session, now_application_identity, document_name='referral.pdf', is_referral_package=True)

        resp = _archive(test_client, auth_headers, now_application_identity, [package_document, blocked_document])

        assert resp.status_code == 400
        assert 'referral.pdf' in resp.json['message']
        _assert_not_archived(db_session, package_document)
        _assert_not_archived(db_session, blocked_document)
        db_session.refresh(package_xref)
        assert package_xref.is_final_package is True
        assert package_xref.final_package_order == 1

    def test_duplicate_guids_are_archived_once(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity)

        resp = _archive(test_client, auth_headers, now_application_identity, [mine_document, mine_document])

        assert resp.status_code == 204, resp.data
        _assert_archived(db_session, mine_document)

    def test_empty_list_returns_400(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()

        resp = _archive(test_client, auth_headers, now_application_identity, [])

        assert resp.status_code == 400

    def test_document_on_another_application_returns_404(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        other_now_application_identity = NOWApplicationIdentityFactory()
        own_document, _ = _make_core_document(db_session, now_application_identity)
        other_document, _ = _make_core_document(db_session, other_now_application_identity)

        resp = _archive(test_client, auth_headers, now_application_identity, [own_document, other_document])

        assert resp.status_code == 404
        _assert_not_archived(db_session, own_document)
        _assert_not_archived(db_session, other_document)

    def test_flag_off_returns_503(self, test_client, db_session, auth_headers, feature_flag):
        feature_flag.return_value = False
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity)

        resp = _archive(test_client, auth_headers, now_application_identity, [mine_document])

        assert resp.status_code == 503
        _assert_not_archived(db_session, mine_document)

    def test_already_archived_document_blocked(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity)
        mine_document.is_archived = True
        db_session.commit()

        resp = _archive(test_client, auth_headers, now_application_identity, [mine_document])

        assert resp.status_code == 400
        assert 'archived' in resp.json['message']


class TestPermitPackageArchiveRules:
    """Archive rules for permit package documents: allowed while in progress, blocked once locked or delayed"""

    @pytest.mark.parametrize('status_code', LOCKED_STATUS_CODES)
    def test_permit_package_document_blocked_once_locked(self, test_client, db_session, auth_headers, status_code):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, xref = _make_core_document(db_session, now_application_identity, **PERMIT_PACKAGE_FIELDS)
        _set_status(db_session, now_application_identity, status_code)

        _assert_archive_blocked(test_client, db_session, auth_headers, now_application_identity, mine_document,
                                'once the application has a decision')
        db_session.refresh(xref)
        assert xref.is_final_package is True

    def test_permit_package_document_blocked_while_delayed(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity, **PERMIT_PACKAGE_FIELDS)
        _start_delay(db_session, now_application_identity)

        _assert_archive_blocked(test_client, db_session, auth_headers, now_application_identity, mine_document,
                                'while the application is delayed')


class TestGovernmentDocumentArchiveRules:
    """Archive rules for Government documents: allowed once locked, blocked while delayed"""

    @pytest.mark.parametrize('status_code', LOCKED_STATUS_CODES)
    def test_government_document_can_be_archived_once_locked(self, test_client, db_session, auth_headers, status_code):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity)
        _set_status(db_session, now_application_identity, status_code)

        _assert_archive_allowed(test_client, db_session, auth_headers, now_application_identity, mine_document)

    def test_government_document_blocked_while_delayed(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity)
        _start_delay(db_session, now_application_identity)

        _assert_archive_blocked(test_client, db_session, auth_headers, now_application_identity, mine_document,
                                'while the application is delayed')


class TestApplicationDocumentArchiveRules:
    """Archive rules for Application documents, including vFCBC imports: allowed once locked or delayed"""

    def test_application_document_can_be_archived_once_locked_and_delayed(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(
            db_session, now_application_identity, document_type_code=APPLICATION_DOCUMENT_TYPE)
        _set_status(db_session, now_application_identity, 'AIA')
        _start_delay(db_session, now_application_identity)

        _assert_archive_allowed(test_client, db_session, auth_headers, now_application_identity, mine_document)

    def test_imported_document_can_be_archived_once_locked_and_delayed(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_imported_document(db_session, now_application_identity)
        _set_status(db_session, now_application_identity, 'AIA')
        _start_delay(db_session, now_application_identity)

        _assert_archive_allowed(test_client, db_session, auth_headers, now_application_identity, mine_document)


class TestAlwaysBlockedArchive:
    """Archive rules for documents that can never be archived from Manage Documents"""

    def test_system_generated_document_blocked(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(
            db_session, now_application_identity, document_type_code=SYSTEM_GENERATED_DOCUMENT_TYPE,
            is_system_generated=True)

        _assert_archive_blocked(test_client, db_session, auth_headers, now_application_identity, mine_document,
                                'System-generated')

    @pytest.mark.parametrize('package_field', ['is_referral_package', 'is_consultation_package'])
    def test_referral_and_consultation_documents_blocked(self, test_client, db_session, auth_headers, package_field):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(db_session, now_application_identity, **{package_field: True})

        _assert_archive_blocked(test_client, db_session, auth_headers, now_application_identity, mine_document,
                                'Referral or Consultation')

    def test_imported_referral_document_blocked(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_imported_document(db_session, now_application_identity, is_referral_package=True)

        _assert_archive_blocked(test_client, db_session, auth_headers, now_application_identity, mine_document,
                                'Referral or Consultation')

    def test_document_outside_manage_documents_tables_blocked(self, test_client, db_session, auth_headers):
        now_application_identity = NOWApplicationIdentityFactory()
        mine_document, _ = _make_core_document(
            db_session, now_application_identity, document_type_code=SYSTEM_GENERATED_DOCUMENT_TYPE)

        _assert_archive_blocked(test_client, db_session, auth_headers, now_application_identity, mine_document,
                                'cannot be changed from Manage Documents')

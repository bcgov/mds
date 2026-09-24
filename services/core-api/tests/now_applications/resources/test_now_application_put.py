import json, decimal, pytest
from flask_restx import marshal, fields

from app.api.now_applications.response_models import NOW_APPLICATION_MODEL
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from tests.now_application_factories import NOWApplicationIdentityFactory, NOWApplicationFactory
from tests.factories import MineDocumentFactory
from unittest.mock import patch


def _make_bulk_document_xref(now_application_identity):
    mine_doc = MineDocumentFactory(mine=now_application_identity.mine)
    xref = NOWApplicationDocumentXref(
        now_application_id=now_application_identity.now_application_id,
        mine_document_guid=mine_doc.mine_document_guid,
        now_application_document_type_code='OTH')
    return mine_doc, xref


def _find_document_data(data, xref_guid):
    return next(
        doc for doc in data['documents']
        if doc['now_application_document_xref_guid'] == str(xref_guid))


class TestNOWApplication:
    """PUT mines/now-applications/<guid>"""
    @pytest.mark.skip(
        reason='Application changes now fire a request to NROS so need to mock the service call.')
    def test_put_application_field(self, test_client, db_session, auth_headers):
        now_application = NOWApplicationFactory()
        test_application = NOWApplicationIdentityFactory(now_application=now_application)
        assert test_application.now_application
        data = marshal(test_application.now_application, NOW_APPLICATION_MODEL)

        new_latitude = '-55.111'
        data['latitude'] = new_latitude

        put_resp = test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])
        assert put_resp.status_code == 200, put_resp.response

        put_data = json.loads(put_resp.data.decode())
        assert decimal.Decimal(put_data['latitude']) == decimal.Decimal(new_latitude)

    @patch('app.api.now_applications.resources.now_application_resource.NROSNOWStatusService.nros_now_status_update')
    @patch('app.api.now_applications.resources.now_application_resource.DocumentManagerService.importNoticeOfWorkSubmissionDocuments')
    def test_put_now_application_tier_code(self, mock_import_docs, mock_nros, test_client, db_session, auth_headers):
        now_application = NOWApplicationFactory()
        test_application = NOWApplicationIdentityFactory(now_application=now_application)
        assert test_application.now_application
        data = marshal(test_application.now_application, NOW_APPLICATION_MODEL)

        assert data.get('now_application_tier_code') is None

        # Set tier for the first time
        data['now_application_tier_code'] = 'T1'
        data['now_application_tier_description'] = 'Sample reason for T1'
        put_resp1 = test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])

        assert put_resp1.status_code == 200, put_resp1.response
        put_data1 = json.loads(put_resp1.data.decode())
        assert put_data1['now_application_tier_code'] == 'T1'

        # Update tier
        assert put_data1['now_application_tier_code'] == 'T1'
        assert put_data1['now_application_tier_description'] == 'Sample reason for T1'

        # Update tier code and description
        data['now_application_tier_code'] = 'T2'
        data['now_application_tier_description'] = 'Updated reason for T2'
        put_resp2 = test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])

        assert put_resp2.status_code == 200, put_resp2.response
        put_data2 = json.loads(put_resp2.data.decode())
        assert put_data2['now_application_tier_code'] == 'T2'
        assert put_data2['now_application_tier_description'] == 'Updated reason for T2'

        # Latest tier should be T2
        assert test_application.now_application.now_application_tier_code == 'T2'

    @patch('app.api.now_applications.resources.now_application_resource.NROSNOWStatusService.nros_now_status_update')
    @patch('app.api.now_applications.resources.now_application_resource.DocumentManagerService.importNoticeOfWorkSubmissionDocuments')
    def test_put_now_application_tier_invalid_code(self, mock_import_docs, mock_nros, test_client, db_session, auth_headers):
        now_application = NOWApplicationFactory()
        test_application = NOWApplicationIdentityFactory(now_application=now_application)
        data = marshal(test_application.now_application, NOW_APPLICATION_MODEL)

        data['now_application_tier_code'] = 'INV'
        put_resp = test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])

        assert put_resp.status_code == 400
        assert b'Invalid Tier Category code: INV' in put_resp.data

    @patch('app.api.now_applications.resources.now_application_resource.NROSNOWStatusService.nros_now_status_update')
    @patch('app.api.now_applications.resources.now_application_resource.DocumentManagerService.importNoticeOfWorkSubmissionDocuments')
    def test_put_now_application_tier_null_code_on_existing_tier(self, mock_import_docs, mock_nros, test_client, db_session, auth_headers):
        now_application = NOWApplicationFactory()
        test_application = NOWApplicationIdentityFactory(now_application=now_application)
        data = marshal(test_application.now_application, NOW_APPLICATION_MODEL)

        # First set it
        data['now_application_tier_code'] = 'T1'
        test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])

        # Now try to set it to null
        data['now_application_tier_code'] = None
        put_resp = test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])

        assert put_resp.status_code == 400
        assert b'Tier Category code cannot be null.' in put_resp.data

    @patch('app.api.now_applications.resources.now_application_resource.NROSNOWStatusService.nros_now_status_update')
    @patch('app.api.now_applications.resources.now_application_resource.DocumentManagerService.importNoticeOfWorkSubmissionDocuments')
    def test_put_documents_assigns_order_to_existing_document_added_to_package(
            self, mock_import_docs, mock_nros, test_client, db_session, auth_headers):
        now_application = NOWApplicationFactory()
        test_application = NOWApplicationIdentityFactory(now_application=now_application)
        mine_doc, xref = _make_bulk_document_xref(test_application)
        db_session.add(xref)
        db_session.commit()

        data = marshal(test_application.now_application, NOW_APPLICATION_MODEL)
        doc_data = _find_document_data(data, xref.now_application_document_xref_guid)
        doc_data['is_final_package'] = True
        doc_data['permit_package_document_type_code'] = 'DOCUMENT'

        put_resp = test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])

        assert put_resp.status_code == 200, put_resp.response
        db_session.refresh(xref)
        assert xref.final_package_order == 1

    @patch('app.api.now_applications.resources.now_application_resource.NROSNOWStatusService.nros_now_status_update')
    @patch('app.api.now_applications.resources.now_application_resource.DocumentManagerService.importNoticeOfWorkSubmissionDocuments')
    def test_put_documents_increments_order_locally_for_multiple_same_type_documents_in_one_request(
            self, mock_import_docs, mock_nros, test_client, db_session, auth_headers):
        now_application = NOWApplicationFactory()
        test_application = NOWApplicationIdentityFactory(now_application=now_application)
        mine_doc_1, xref_1 = _make_bulk_document_xref(test_application)
        mine_doc_2, xref_2 = _make_bulk_document_xref(test_application)
        db_session.add(xref_1)
        db_session.add(xref_2)
        db_session.commit()

        data = marshal(test_application.now_application, NOW_APPLICATION_MODEL)
        for xref in (xref_1, xref_2):
            doc_data = _find_document_data(data, xref.now_application_document_xref_guid)
            doc_data['is_final_package'] = True
            doc_data['permit_package_document_type_code'] = 'DOCUMENT'

        put_resp = test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])

        assert put_resp.status_code == 200, put_resp.response
        db_session.refresh(xref_1)
        db_session.refresh(xref_2)
        orders = sorted([xref_1.final_package_order, xref_2.final_package_order])
        assert orders == [1, 2]

    @patch('app.api.now_applications.resources.now_application_resource.NROSNOWStatusService.nros_now_status_update')
    @patch('app.api.now_applications.resources.now_application_resource.DocumentManagerService.importNoticeOfWorkSubmissionDocuments')
    def test_put_documents_scopes_order_independently_per_type(
            self, mock_import_docs, mock_nros, test_client, db_session, auth_headers):
        now_application = NOWApplicationFactory()
        test_application = NOWApplicationIdentityFactory(now_application=now_application)

        existing_figure_mine_doc, existing_figure_xref = _make_bulk_document_xref(test_application)
        existing_figure_xref.is_final_package = True
        existing_figure_xref.permit_package_document_type_code = 'FIGURE'
        existing_figure_xref.final_package_order = 1
        db_session.add(existing_figure_xref)

        new_figure_mine_doc, new_figure_xref = _make_bulk_document_xref(test_application)
        new_document_mine_doc, new_document_xref = _make_bulk_document_xref(test_application)
        db_session.add(new_figure_xref)
        db_session.add(new_document_xref)
        db_session.commit()

        data = marshal(test_application.now_application, NOW_APPLICATION_MODEL)
        figure_doc_data = _find_document_data(data, new_figure_xref.now_application_document_xref_guid)
        figure_doc_data['is_final_package'] = True
        figure_doc_data['permit_package_document_type_code'] = 'FIGURE'
        document_doc_data = _find_document_data(data, new_document_xref.now_application_document_xref_guid)
        document_doc_data['is_final_package'] = True
        document_doc_data['permit_package_document_type_code'] = 'DOCUMENT'

        put_resp = test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])

        assert put_resp.status_code == 200, put_resp.response
        db_session.refresh(new_figure_xref)
        db_session.refresh(new_document_xref)
        # Figure pool already had order 1, so the new Figure lands at 2.
        assert new_figure_xref.final_package_order == 2
        # Document pool was empty, so the new Document starts fresh at 1 - unaffected by
        # the Figure pool's count.
        assert new_document_xref.final_package_order == 1

    @patch('app.api.now_applications.resources.now_application_resource.NROSNOWStatusService.nros_now_status_update')
    @patch('app.api.now_applications.resources.now_application_resource.DocumentManagerService.importNoticeOfWorkSubmissionDocuments')
    def test_put_documents_preserves_order_on_resend_unchanged(
            self, mock_import_docs, mock_nros, test_client, db_session, auth_headers):
        now_application = NOWApplicationFactory()
        test_application = NOWApplicationIdentityFactory(now_application=now_application)
        mine_doc, xref = _make_bulk_document_xref(test_application)
        xref.is_final_package = True
        xref.permit_package_document_type_code = 'DOCUMENT'
        xref.final_package_order = 3
        db_session.add(xref)
        db_session.commit()

        data = marshal(test_application.now_application, NOW_APPLICATION_MODEL)

        put_resp = test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])

        assert put_resp.status_code == 200, put_resp.response
        db_session.refresh(xref)
        assert xref.final_package_order == 3

    @patch('app.api.now_applications.resources.now_application_resource.NROSNOWStatusService.nros_now_status_update')
    @patch('app.api.now_applications.resources.now_application_resource.DocumentManagerService.importNoticeOfWorkSubmissionDocuments')
    def test_put_documents_clears_order_and_type_on_removal_via_bulk_modal(
            self, mock_import_docs, mock_nros, test_client, db_session, auth_headers):
        now_application = NOWApplicationFactory()
        test_application = NOWApplicationIdentityFactory(now_application=now_application)
        mine_doc, xref = _make_bulk_document_xref(test_application)
        xref.is_final_package = True
        xref.permit_package_document_type_code = 'FIGURE'
        xref.final_package_order = 5
        db_session.add(xref)
        db_session.commit()

        data = marshal(test_application.now_application, NOW_APPLICATION_MODEL)
        doc_data = _find_document_data(data, xref.now_application_document_xref_guid)
        doc_data['is_final_package'] = False

        put_resp = test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])

        assert put_resp.status_code == 200, put_resp.response
        db_session.refresh(xref)
        assert xref.final_package_order is None
        assert xref.permit_package_document_type_code is None

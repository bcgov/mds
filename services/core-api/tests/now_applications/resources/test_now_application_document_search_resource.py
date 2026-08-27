import json
from datetime import datetime
from unittest.mock import MagicMock, patch

from app.api.now_applications.models.now_application_document_index_run import NowApplicationDocumentIndexRun
from app.api.now_applications.models.now_application_document_xref import NOWApplicationDocumentXref
from tests.now_application_factories import NOWApplicationIdentityFactory
from tests.factories import MineDocumentFactory


def test_get_now_application_document_search_status(test_client, db_session, auth_headers):
    now_application_identity = NOWApplicationIdentityFactory()

    with patch(
        'app.api.now_applications.resources.now_application_document_search_resource.is_feature_enabled',
        return_value=True,
    ), patch(
        'app.api.now_applications.resources.now_application_document_search_resource.NowApplicationSearchService.get_index_status'
    ) as mock_get_status:

        mock_get_status.return_value = {'status': 'success'}

        resp = test_client.get(
            f'/now-applications/{now_application_identity.now_application_guid}/document-search/index/status',
            headers=auth_headers['full_auth_header']
        )

        assert resp.status_code == 200
        assert resp.json == {'status': 'success'}


def test_get_now_application_document_search_status_includes_document_count(test_client, db_session, auth_headers):
    now_application_identity = NOWApplicationIdentityFactory()
    NowApplicationDocumentIndexRun.create(
        now_application_guid=now_application_identity.now_application_guid,
        status='success',
        document_count=3,
        items_processed=42,
        last_run_start=datetime.utcnow(),
        last_run_end=datetime.utcnow(),
    )

    with patch(
        'app.api.now_applications.resources.now_application_document_search_resource.is_feature_enabled',
        return_value=True,
    ), patch(
        'app.api.now_applications.resources.now_application_document_search_resource.NowApplicationSearchService.get_index_status'
    ) as mock_get_status:

        mock_get_status.return_value = {'status': 'success', 'items_processed': 42}

        resp = test_client.get(
            f'/now-applications/{now_application_identity.now_application_guid}/document-search/index/status',
            headers=auth_headers['full_auth_header']
        )

        assert resp.status_code == 200
        assert resp.json['document_count'] == 3


def test_get_now_application_document_search_status_prefers_fresh_live_status_while_run_still_running(
    test_client, db_session, auth_headers
):
    """
    Regression test: if the persisted run row hasn't been updated to a terminal
    status yet (the poll task hasn't ticked), the endpoint must return the live
    status from permits rather than clobbering it with the stale "running" row.
    """
    now_application_identity = NOWApplicationIdentityFactory()
    NowApplicationDocumentIndexRun.create(
        now_application_guid=now_application_identity.now_application_guid,
        status='running',
        document_count=3,
        items_processed=0,
        last_run_start=datetime.utcnow(),
    )

    with patch(
        'app.api.now_applications.resources.now_application_document_search_resource.is_feature_enabled',
        return_value=True,
    ), patch(
        'app.api.now_applications.resources.now_application_document_search_resource.NowApplicationSearchService.get_index_status'
    ) as mock_get_status:

        mock_get_status.return_value = {
            'status': 'success',
            'items_processed': 99,
            'error_count': 0,
            'error_message': None,
        }

        resp = test_client.get(
            f'/now-applications/{now_application_identity.now_application_guid}/document-search/index/status',
            headers=auth_headers['full_auth_header']
        )

        assert resp.status_code == 200
        assert resp.json['status'] == 'success'
        assert resp.json['items_processed'] == 99
        assert resp.json['document_count'] == 3


def test_get_now_application_document_search_status_uses_persisted_status_once_run_is_terminal(
    test_client, db_session, auth_headers
):
    """
    Once the run row has reached a terminal status, its persisted values are
    authoritative — this is what keeps status correct after permits' Redis-backed
    task state has expired and it falls back to a different live status.
    """
    now_application_identity = NOWApplicationIdentityFactory()
    NowApplicationDocumentIndexRun.create(
        now_application_guid=now_application_identity.now_application_guid,
        status='success',
        document_count=3,
        items_processed=42,
        error_count=0,
        error_message=None,
        last_run_start=datetime.utcnow(),
        last_run_end=datetime.utcnow(),
    )

    with patch(
        'app.api.now_applications.resources.now_application_document_search_resource.is_feature_enabled',
        return_value=True,
    ), patch(
        'app.api.now_applications.resources.now_application_document_search_resource.NowApplicationSearchService.get_index_status'
    ) as mock_get_status:

        # Simulate permits falling back to a different live status (e.g. Redis task
        # keys expired) — the persisted run status should win.
        mock_get_status.return_value = {'status': 'never_run', 'items_processed': 0}

        resp = test_client.get(
            f'/now-applications/{now_application_identity.now_application_guid}/document-search/index/status',
            headers=auth_headers['full_auth_header']
        )

        assert resp.status_code == 200
        assert resp.json['status'] == 'success'
        assert resp.json['items_processed'] == 42


def test_post_now_application_document_index(test_client, db_session, auth_headers):
    now_application_identity = NOWApplicationIdentityFactory()
    mine_doc = MineDocumentFactory(mine=now_application_identity.mine)

    xref = NOWApplicationDocumentXref(
        now_application_id=now_application_identity.now_application_id,
        mine_document_guid=mine_doc.mine_document_guid,
        now_application_document_type_code='OTH'
    )
    db_session.add(xref)
    db_session.commit()

    with patch(
        'app.api.now_applications.resources.now_application_document_search_resource.is_feature_enabled',
        return_value=True,
    ), patch(
        'app.api.now_applications.resources.now_application_document_search_resource.NowApplicationSearchService.index_documents'
    ) as mock_index, patch(
        'app.api.now_applications.resources.now_application_document_search_resource.poll_update_now_application_document_index_status.delay'
    ) as mock_poll_delay:

        mock_index.return_value = {'status': 'running', 'queued': 1}
        mock_poll_delay.return_value = MagicMock(id='test-task-id')

        resp = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/document-search/index',
            headers=auth_headers['full_auth_header']
        )

        assert resp.status_code == 200
        assert resp.json == {'status': 'running', 'queued': 1}
        mock_poll_delay.assert_called_once()

        run = NowApplicationDocumentIndexRun.get_latest_by_now_application_guid(
            now_application_identity.now_application_guid)
        assert run is not None
        assert run.status == 'running'
        assert run.document_count == 1
        assert run.last_run_start is not None
        assert run.core_status_task_id == 'test-task-id'


def test_delete_now_application_document_index(test_client, db_session, auth_headers):
    now_application_identity = NOWApplicationIdentityFactory()

    with patch(
        'app.api.now_applications.resources.now_application_document_search_resource.is_feature_enabled',
        return_value=True,
    ), patch(
        'app.api.now_applications.resources.now_application_document_search_resource.NowApplicationSearchService.cancel_indexing'
    ) as mock_cancel:

        mock_cancel.return_value = {'message': 'cancelled'}

        resp = test_client.delete(
            f'/now-applications/{now_application_identity.now_application_guid}/document-search/index',
            headers=auth_headers['full_auth_header']
        )

        assert resp.status_code == 200
        assert resp.json == {'message': 'cancelled'}


def test_delete_now_application_document_index_marks_running_run_cancelled(test_client, db_session, auth_headers):
    now_application_identity = NOWApplicationIdentityFactory()
    run = NowApplicationDocumentIndexRun.create(
        now_application_guid=now_application_identity.now_application_guid,
        status='running',
        document_count=2,
        last_run_start=datetime.utcnow(),
    )

    with patch(
        'app.api.now_applications.resources.now_application_document_search_resource.is_feature_enabled',
        return_value=True,
    ), patch(
        'app.api.now_applications.resources.now_application_document_search_resource.NowApplicationSearchService.cancel_indexing'
    ) as mock_cancel:

        mock_cancel.return_value = {'message': 'cancelled'}

        resp = test_client.delete(
            f'/now-applications/{now_application_identity.now_application_guid}/document-search/index',
            headers=auth_headers['full_auth_header']
        )

        assert resp.status_code == 200

        refreshed = NowApplicationDocumentIndexRun.query.get(run.now_application_document_index_run_id)
        assert refreshed.status == 'cancelled'
        assert refreshed.last_run_end is not None


def test_delete_now_application_document_index_does_not_touch_already_terminal_run(
    test_client, db_session, auth_headers
):
    now_application_identity = NOWApplicationIdentityFactory()
    run = NowApplicationDocumentIndexRun.create(
        now_application_guid=now_application_identity.now_application_guid,
        status='success',
        document_count=2,
        last_run_start=datetime.utcnow(),
        last_run_end=datetime.utcnow(),
    )

    with patch(
        'app.api.now_applications.resources.now_application_document_search_resource.is_feature_enabled',
        return_value=True,
    ), patch(
        'app.api.now_applications.resources.now_application_document_search_resource.NowApplicationSearchService.cancel_indexing'
    ) as mock_cancel:

        mock_cancel.return_value = {'message': 'cancelled'}

        test_client.delete(
            f'/now-applications/{now_application_identity.now_application_guid}/document-search/index',
            headers=auth_headers['full_auth_header']
        )

        refreshed = NowApplicationDocumentIndexRun.query.get(run.now_application_document_index_run_id)
        assert refreshed.status == 'success'


def test_post_now_application_document_search(test_client, db_session, auth_headers):
    now_application_identity = NOWApplicationIdentityFactory()

    with patch(
        'app.api.now_applications.resources.now_application_document_search_resource.is_feature_enabled',
        return_value=True,
    ), patch(
        'app.api.now_applications.resources.now_application_document_search_resource.NowApplicationSearchService.search'
    ) as mock_search:
        mock_search.return_value = [b'event: documents\ndata: {"results": []}\n\n']

        resp = test_client.post(
            f'/now-applications/{now_application_identity.now_application_guid}/document-search',
            json={'query': 'test'},
            headers=auth_headers['full_auth_header']
        )

        assert resp.status_code == 200
        assert resp.mimetype == 'text/event-stream'


def test_collect_indexable_documents_filters_spatial(db_session):
    from app.api.now_applications.resources.now_application_document_search_resource import _collect_indexable_documents
    now_application_identity = NOWApplicationIdentityFactory()
    now_app = now_application_identity.now_application
    mine = now_application_identity.mine

    doc1 = MineDocumentFactory(mine=mine, document_name='report.pdf')
    xref1 = NOWApplicationDocumentXref(
        now_application_id=now_app.now_application_id,
        mine_document=doc1,
        now_application_document_type_code='OTH'
    )

    doc2 = MineDocumentFactory(mine=mine, document_name='map.shp')
    xref2 = NOWApplicationDocumentXref(
        now_application_id=now_app.now_application_id,
        mine_document=doc2,
        now_application_document_type_code='OTH'
    )

    doc3 = MineDocumentFactory(mine=mine, document_name='old.pdf')
    doc3.deleted_ind = True
    xref3 = NOWApplicationDocumentXref(
        now_application_id=now_app.now_application_id,
        mine_document=doc3,
        now_application_document_type_code='OTH'
    )

    now_app.documents = [xref1, xref2, xref3]

    documents = _collect_indexable_documents(now_app)

    assert len(documents) == 1
    assert documents[0]['document_name'] == 'report.pdf'

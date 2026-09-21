from datetime import datetime, timedelta

from app.api.now_applications.models.now_application_document_index_run import (
    NowApplicationDocumentIndexRun,
)
from tests.now_application_factories import NOWApplicationIdentityFactory


def test_get_latest_by_now_application_guid_returns_most_recent_run(db_session):
    now_application_identity = NOWApplicationIdentityFactory()

    older = NowApplicationDocumentIndexRun.create(
        now_application_guid=now_application_identity.now_application_guid,
        status='success',
        last_run_start=datetime.utcnow() - timedelta(hours=1),
    )
    newer = NowApplicationDocumentIndexRun.create(
        now_application_guid=now_application_identity.now_application_guid,
        status='running',
        last_run_start=datetime.utcnow(),
    )

    latest = NowApplicationDocumentIndexRun.get_latest_by_now_application_guid(
        now_application_identity.now_application_guid)

    assert latest.now_application_document_index_run_id == newer.now_application_document_index_run_id
    assert latest.now_application_document_index_run_id != older.now_application_document_index_run_id


def test_get_latest_by_now_application_guid_returns_none_when_no_runs_exist(db_session):
    now_application_identity = NOWApplicationIdentityFactory()

    assert NowApplicationDocumentIndexRun.get_latest_by_now_application_guid(
        now_application_identity.now_application_guid) is None

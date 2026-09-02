import json
from types import SimpleNamespace
from unittest.mock import patch

import pytest

from app import create_app
from app.config import TestConfig
from app.docman.utils.spatial_bundle_service import (
    VALIDATION_STATUS_UNABLE_TO_VALIDATE,
    VALIDATION_STATUS_VALID,
)
from app.tasks.process_now_spatial_bundles import (
    mine_guid_from_documents,
    process_spatial_document_guids,
    sync_bundle_to_core,
)

_TASK_PATH = 'app.tasks.process_now_spatial_bundles'
_SERVICE_PATH = 'app.docman.utils.spatial_bundle_service'


@pytest.fixture(scope='module')
def app_context():
    """The task runs on a worker, so it needs an app context but no request context."""
    ctx = create_app(TestConfig).app_context()
    ctx.push()
    yield
    ctx.pop()


def _doc(name, guid=None, path=None):
    return SimpleNamespace(
        file_display_name=name,
        document_guid=guid or name,
        document_bundle_guid=None,
        document_bundle=None,
        upload_completed_date=None,
        update_user=None,
        full_storage_path=path,
        path_display_name=path,
    )


def _run(documents):
    return process_spatial_document_guids.run([str(doc.document_guid) for doc in documents])


class TestProcessSpatialDocumentGuids:
    """app.tasks.process_now_spatial_bundles.process_spatial_document_guids"""

    def test_no_guids_short_circuits(self, app_context):
        assert process_spatial_document_guids.run([]) == {'success': True, 'bundles': []}

    @patch(f'{_TASK_PATH}.Document')
    def test_unknown_guids_raise_for_retry(self, mock_document, app_context):
        mock_document.query.filter.return_value.all.return_value = []

        with pytest.raises(Exception, match='Documents not found'):
            _run([_doc('area.kml')])

    @patch(f'{_TASK_PATH}.sync_bundle_to_core')
    @patch(f'{_TASK_PATH}.get_core_authorization_token', return_value='Bearer test')
    @patch(f'{_TASK_PATH}.Document')
    @patch(f'{_SERVICE_PATH}.GeomarkHelper')
    @patch(f'{_SERVICE_PATH}.DocumentUploadHelper')
    @patch(f'{_SERVICE_PATH}.db')
    @patch(f'{_SERVICE_PATH}.os.path.exists', return_value=True)
    @patch(f'{_SERVICE_PATH}.os.path.getsize', return_value=100)
    @patch(f'{_SERVICE_PATH}.os.makedirs')
    def test_single_kml_is_validated_and_synced(self, _makedirs, _getsize, _exists, _db,
                                                _upload_helper, mock_geomark, mock_document,
                                                _token, mock_sync, app_context):
        documents = [_doc('area.kml')]
        mock_document.query.filter.return_value.all.return_value = documents
        mock_geomark.return_value.send_spatial_file_to_geomark.return_value = {'id': 'gm-kml'}
        mock_geomark.return_value.fetch_geomark_metadata.return_value = {}
        mock_sync.return_value = {'bundle_id': 1}

        result = _run(documents)

        assert result['success'] is True
        assert len(result['bundles']) == 1
        synced_result = mock_sync.call_args[0][0]
        assert synced_result['validation_status'] == VALIDATION_STATUS_VALID
        assert synced_result['geomark_id'] == 'gm-kml'
        assert synced_result['document_guids'] == ['area.kml']

    @patch(f'{_TASK_PATH}.sync_bundle_to_core')
    @patch(f'{_TASK_PATH}.get_core_authorization_token', return_value='Bearer test')
    @patch(f'{_TASK_PATH}.Document')
    @patch(f'{_SERVICE_PATH}.GeomarkHelper')
    @patch(f'{_SERVICE_PATH}.DocumentUploadHelper')
    @patch(f'{_SERVICE_PATH}.db')
    @patch(f'{_SERVICE_PATH}.os.path.exists', return_value=True)
    @patch(f'{_SERVICE_PATH}.os.path.getsize', return_value=100)
    @patch(f'{_SERVICE_PATH}.os.makedirs')
    def test_shapefile_parts_are_bundled_together(self, _makedirs, _getsize, _exists, _db,
                                                  _upload_helper, mock_geomark, mock_document,
                                                  _token, mock_sync, app_context):
        documents = [_doc(f'boundary.{ext}') for ext in ('shp', 'shx', 'dbf', 'prj')]
        mock_document.query.filter.return_value.all.return_value = documents
        mock_geomark.return_value.send_spatial_file_to_geomark.return_value = {'id': 'gm-shp'}
        mock_geomark.return_value.fetch_geomark_metadata.return_value = {}
        mock_sync.return_value = {'bundle_id': 2}

        result = _run(documents)

        assert result['success'] is True
        mock_sync.assert_called_once()
        synced_result = mock_sync.call_args[0][0]
        assert synced_result['name'] == 'boundary'
        assert synced_result['validation_status'] == VALIDATION_STATUS_VALID
        assert len(synced_result['document_guids']) == 4

    @patch(f'{_TASK_PATH}.sync_bundle_to_core')
    @patch(f'{_TASK_PATH}.get_core_authorization_token', return_value='Bearer test')
    @patch(f'{_TASK_PATH}.Document')
    @patch(f'{_SERVICE_PATH}.db')
    def test_incomplete_shapefile_syncs_unable_to_validate(self, _db, mock_document, _token,
                                                           mock_sync, app_context):
        documents = [_doc('boundary.shp'), _doc('boundary.shx'), _doc('boundary.dbf')]
        mock_document.query.filter.return_value.all.return_value = documents
        mock_sync.return_value = {'bundle_id': 3}

        result = _run(documents)

        assert result['success'] is True
        synced_result = mock_sync.call_args[0][0]
        assert synced_result['validation_status'] == VALIDATION_STATUS_UNABLE_TO_VALIDATE
        assert '.prj' in synced_result['validation_error']

    @patch(f'{_TASK_PATH}.requests.post')
    def test_sync_posts_the_validation_status_core_requires(self, mock_post, app_context):
        """Core rejects a bundle POST without a validation_status."""
        mock_post.return_value = SimpleNamespace(status_code=200, json=lambda: {'bundle_id': 9})
        result = {
            'name': 'boundary',
            'docman_bundle_guid': 'bundle-guid',
            'geomark_id': None,
            'validation_status': VALIDATION_STATUS_UNABLE_TO_VALIDATE,
            'validation_error': 'Missing required file types: .prj',
            'validation_checks': {'missing_extensions': ['.prj']},
            'document_guids': ['doc-1'],
        }

        sync_bundle_to_core(result, 'Bearer test', 'mine-guid')

        body = json.loads(mock_post.call_args.kwargs['data'])
        assert body['validation_status'] == VALIDATION_STATUS_UNABLE_TO_VALIDATE
        assert body['docman_bundle_guid'] == 'bundle-guid'

    @patch(f'{_TASK_PATH}.sync_bundle_to_core', side_effect=Exception('Core unavailable'))
    @patch(f'{_TASK_PATH}.get_core_authorization_token', return_value='Bearer test')
    @patch(f'{_TASK_PATH}.Document')
    @patch(f'{_SERVICE_PATH}.db')
    def test_core_sync_failure_is_reported(self, _db, mock_document, _token, _sync, app_context):
        documents = [_doc('boundary.shp')]
        mock_document.query.filter.return_value.all.return_value = documents

        with pytest.raises(Exception, match='Core unavailable'):
            _run(documents)


class TestMineGuidFromDocuments:
    def test_extracts_guid_from_storage_path(self):
        mine_guid = '18133c75-49ad-4101-85f3-a43e35ae989a'
        documents = [_doc('area.kml', path=f'mines/{mine_guid}/noticeofwork/area.kml')]
        assert mine_guid_from_documents(documents) == mine_guid

    def test_returns_none_when_paths_are_empty(self):
        assert mine_guid_from_documents([_doc('area.kml')]) is None


class TestAuditUserOutsideRequestContext:
    """Bundles are created on a Celery worker, where the AuditMixin defaults cannot resolve."""

    def test_falls_back_to_system_user(self, app_context):
        from app.docman.utils.spatial_bundle_service import SYSTEM_USER, SpatialBundleService

        assert SpatialBundleService._audit_user() == SYSTEM_USER

    @patch(f'{_SERVICE_PATH}.db')
    def test_links_documents_with_an_explicit_update_user(self, _db, app_context):
        from app.docman.utils.spatial_bundle_service import SYSTEM_USER, SpatialBundleService

        documents = [_doc('boundary.shp'), _doc('boundary.shx'), _doc('boundary.dbf')]
        SpatialBundleService.process_document_group(documents, blocking=False)

        assert all(doc.update_user == SYSTEM_USER for doc in documents)
        assert all(doc.document_bundle.create_user == SYSTEM_USER for doc in documents)

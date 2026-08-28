import json
import uuid

from unittest.mock import patch

from flask_restx import marshal

from app.api.now_applications.resources.now_application_resource import NOWApplicationResource
from app.api.now_applications.response_models import NOW_APPLICATION_MODEL
from tests.now_application_factories import NOWApplicationFactory, NOWApplicationIdentityFactory

_RESOURCE_PATH = 'app.api.now_applications.resources.now_application_resource'


def _document_payload(document_name, document_manager_guid, mine_guid, xref_guid=None):
    payload = {
        'now_application_document_type_code': 'OTH',
        'description': 'test',
        'mine_document': {
            'document_name': document_name,
            'document_manager_guid': str(document_manager_guid),
            'mine_guid': str(mine_guid),
        },
    }
    if xref_guid:
        payload['now_application_document_xref_guid'] = str(xref_guid)
    return payload


class TestGetSpatialDocumentGuidsToProcess:
    """NOWApplicationResource._get_spatial_document_guids_to_process"""

    def test_returns_spatial_documents_being_added(self):
        guid = uuid.uuid4()
        documents = [
            _document_payload('boundary.shp', guid, uuid.uuid4()),
        ]

        assert NOWApplicationResource._get_spatial_document_guids_to_process(documents) == [
            str(guid)
        ]

    def test_includes_non_spatial_files_when_any_document_is_new(self):
        shp = uuid.uuid4()
        pdf = uuid.uuid4()
        documents = [
            _document_payload('boundary.shp', shp, uuid.uuid4()),
            _document_payload('report.pdf', pdf, uuid.uuid4()),
        ]

        assert NOWApplicationResource._get_spatial_document_guids_to_process(documents) == [
            str(shp),
            str(pdf),
        ]

    def test_ignores_documents_already_on_the_application(self):
        documents = [
            _document_payload(
                'boundary.kml', uuid.uuid4(), uuid.uuid4(), xref_guid=uuid.uuid4())
        ]

        assert NOWApplicationResource._get_spatial_document_guids_to_process(documents) == []

    def test_ignores_documents_without_a_document_manager_guid(self):
        documents = [{
            'now_application_document_type_code': 'OTH',
            'mine_document': {
                'document_name': 'boundary.kml'
            }
        }]

        assert NOWApplicationResource._get_spatial_document_guids_to_process(documents) == []

    def test_handles_missing_documents(self):
        assert NOWApplicationResource._get_spatial_document_guids_to_process(None) == []

    def test_groups_all_parts_of_a_shapefile(self):
        mine_guid = uuid.uuid4()
        guids = [uuid.uuid4() for _ in range(4)]
        documents = [
            _document_payload(f'boundary.{ext}', guid, mine_guid)
            for ext, guid in zip(('shp', 'shx', 'dbf', 'prj'), guids)
        ]

        assert NOWApplicationResource._get_spatial_document_guids_to_process(documents) == [
            str(guid) for guid in guids
        ]

    def test_includes_existing_sidecars_when_a_part_is_added(self):
        mine_guid = uuid.uuid4()
        existing = uuid.uuid4()
        added = uuid.uuid4()
        documents = [
            _document_payload('boundary.shp', existing, mine_guid, xref_guid=uuid.uuid4()),
            _document_payload('boundary.prj', added, mine_guid),
        ]

        assert NOWApplicationResource._get_spatial_document_guids_to_process(documents) == [
            str(existing),
            str(added),
        ]


class TestPutTriggersSpatialProcessing:
    """PUT /now-applications/<guid> queues spatial validation for newly added spatial files"""

    def _put(self, test_client, auth_headers, document_name):
        test_application = NOWApplicationIdentityFactory(now_application=NOWApplicationFactory())
        data = marshal(test_application.now_application, NOW_APPLICATION_MODEL)
        document_manager_guid = uuid.uuid4()
        data['documents'] = [
            _document_payload(document_name, document_manager_guid,
                              test_application.mine.mine_guid)
        ]

        resp = test_client.put(
            f'/now-applications/{test_application.now_application_guid}',
            json=data,
            headers=auth_headers['full_auth_header'])

        return resp, str(document_manager_guid)

    @patch(f'{_RESOURCE_PATH}.NROSNOWStatusService.nros_now_status_update')
    @patch(f'{_RESOURCE_PATH}.DocumentManagerService.importNoticeOfWorkSubmissionDocuments')
    @patch(f'{_RESOURCE_PATH}.DocumentManagerService.process_spatial_documents')
    def test_spatial_document_queues_processing(self, mock_process, mock_import, mock_nros,
                                                test_client, db_session, auth_headers):
        resp, document_manager_guid = self._put(test_client, auth_headers, 'boundary.kml')

        assert resp.status_code == 200, resp.data
        mock_process.assert_called_once()
        assert mock_process.call_args[0][1] == [document_manager_guid]
        assert mock_process.call_args[1]['mine_guid'] is not None

    @patch(f'{_RESOURCE_PATH}.NROSNOWStatusService.nros_now_status_update')
    @patch(f'{_RESOURCE_PATH}.DocumentManagerService.importNoticeOfWorkSubmissionDocuments')
    @patch(f'{_RESOURCE_PATH}.DocumentManagerService.process_spatial_documents')
    def test_new_document_queues_processing(self, mock_process, mock_import, mock_nros,
                                            test_client, db_session, auth_headers):
        resp, document_manager_guid = self._put(test_client, auth_headers, 'report.pdf')

        assert resp.status_code == 200, resp.data
        mock_process.assert_called_once()
        assert mock_process.call_args[0][1] == [document_manager_guid]

    @patch(f'{_RESOURCE_PATH}.NROSNOWStatusService.nros_now_status_update')
    @patch(f'{_RESOURCE_PATH}.DocumentManagerService.importNoticeOfWorkSubmissionDocuments')
    @patch(
        f'{_RESOURCE_PATH}.DocumentManagerService.process_spatial_documents',
        side_effect=Exception('Document Manager unavailable'))
    def test_document_manager_failure_does_not_fail_the_save(self, mock_process, mock_import,
                                                             mock_nros, test_client, db_session,
                                                             auth_headers):
        resp, _ = self._put(test_client, auth_headers, 'boundary.kml')

        assert resp.status_code == 200, resp.data
        mock_process.assert_called_once()

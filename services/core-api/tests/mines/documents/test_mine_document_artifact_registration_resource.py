import json
import uuid

import pytest
from app.api.mines.documents.models.mine_document_artifact import MineDocumentArtifact
from tests.factories import MineDocumentFactory


@pytest.fixture(scope="function")
def setup_info(db_session):
    document = MineDocumentFactory()
    yield {
        'document': document,
    }


class TestMineDocumentArtifactRegistrationResource:
    @staticmethod
    def _payload(source_guid: str, mine_guid: str, tables: list, request_id=None):
        return {
            'request_id': request_id or str(uuid.uuid4()),
            'source': {
                'pipeline': 'now_document_indexing',
                'version': 'v1',
                'sent_at': '2026-05-22T00:00:00Z',
            },
            'source_document_manager_guid': source_guid,
            'mine_guid': mine_guid,
            'tables': tables,
        }

    def test_register_artifact_success(self, test_client, auth_headers, setup_info):
        document = setup_info['document']
        source_guid = str(document.document_manager_guid)

        payload = self._payload(
            source_guid=source_guid,
            mine_guid=str(document.mine_guid),
            tables=[{
                'table_id': 't-1',
                'page_number': 1,
                'table_index': 0,
                'rows': [{'a': 'b'}],
                'extractor': {'name': 'di_layout_table_extractor', 'version': 'v1'},
            }],
        )

        response = test_client.post(
            f'/mines/documents/{source_guid}/artifact',
            data=json.dumps(payload),
            content_type='application/json',
            headers=auth_headers['full_auth_header'],
        )

        assert response.status_code == 200
        response_json = json.loads(response.data.decode())
        assert response_json['status'] == 'ok'
        assert response_json['source_document_manager_guid'] == source_guid
        assert response_json['mine_document_guid'] == str(document.mine_document_guid)
        assert response_json['counts']['created'] == 1
        assert response_json['counts']['updated'] == 0
        assert response_json['counts']['unchanged'] == 0

        saved = MineDocumentArtifact.query.filter_by(
            mine_document_guid=document.mine_document_guid,
            artifact_type='table',
            artifact_id='t-1',
            deleted_ind=False,
        ).one_or_none()
        assert saved is not None

    def test_register_artifact_missing_mapping(self, test_client, auth_headers):
        source_guid = str(uuid.uuid4())
        payload = self._payload(
            source_guid=source_guid,
            mine_guid=str(uuid.uuid4()),
            tables=[],
        )

        response = test_client.post(
            f'/mines/documents/{source_guid}/artifact',
            data=json.dumps(payload),
            content_type='application/json',
            headers=auth_headers['full_auth_header'],
        )

        assert response.status_code == 404

    def test_register_artifact_conflict_on_source_guid_mismatch(self, test_client, auth_headers, setup_info):
        document = setup_info['document']
        source_guid = str(document.document_manager_guid)

        payload = self._payload(
            source_guid=str(uuid.uuid4()),
            mine_guid=str(document.mine_guid),
            tables=[],
        )

        response = test_client.post(
            f'/mines/documents/{source_guid}/artifact',
            data=json.dumps(payload),
            content_type='application/json',
            headers=auth_headers['full_auth_header'],
        )

        assert response.status_code == 409

    def test_register_artifact_bad_request_for_invalid_path_guid(self, test_client, auth_headers, setup_info):
        document = setup_info['document']

        payload = self._payload(
            source_guid='not-a-uuid',
            mine_guid=str(document.mine_guid),
            tables=[],
        )

        response = test_client.post(
            '/mines/documents/not-a-uuid/artifact',
            data=json.dumps(payload),
            content_type='application/json',
            headers=auth_headers['full_auth_header'],
        )

        assert response.status_code == 400

    def test_register_artifact_conflict_on_mine_guid_mismatch(self, test_client, auth_headers, setup_info):
        document = setup_info['document']
        source_guid = str(document.document_manager_guid)

        payload = self._payload(
            source_guid=source_guid,
            mine_guid=str(uuid.uuid4()),
            tables=[],
        )

        response = test_client.post(
            f'/mines/documents/{source_guid}/artifact',
            data=json.dumps(payload),
            content_type='application/json',
            headers=auth_headers['full_auth_header'],
        )

        assert response.status_code == 409

    def test_register_artifact_unchanged_then_updated_then_soft_deleted(
        self,
        test_client,
        auth_headers,
        setup_info,
    ):
        document = setup_info['document']
        source_guid = str(document.document_manager_guid)

        base_table = {
            'table_id': 't-1',
            'page_number': 1,
            'table_index': 0,
            'rows': [{'a': 'b'}],
            'extractor': {'name': 'di_layout_table_extractor', 'version': 'v1'},
        }

        # 1) Create
        response = test_client.post(
            f'/mines/documents/{source_guid}/artifact',
            data=json.dumps(self._payload(source_guid, str(document.mine_guid), [base_table])),
            content_type='application/json',
            headers=auth_headers['full_auth_header'],
        )
        assert response.status_code == 200

        # 2) Same payload => unchanged
        response = test_client.post(
            f'/mines/documents/{source_guid}/artifact',
            data=json.dumps(self._payload(source_guid, str(document.mine_guid), [base_table])),
            content_type='application/json',
            headers=auth_headers['full_auth_header'],
        )
        response_json = json.loads(response.data.decode())
        assert response_json['counts']['unchanged'] == 1

        # 3) Modified payload => updated
        changed = dict(base_table)
        changed['rows'] = [{'a': 'updated'}]
        response = test_client.post(
            f'/mines/documents/{source_guid}/artifact',
            data=json.dumps(self._payload(source_guid, str(document.mine_guid), [changed])),
            content_type='application/json',
            headers=auth_headers['full_auth_header'],
        )
        response_json = json.loads(response.data.decode())
        assert response_json['counts']['updated'] == 1

        # 4) Empty list for same extractor version => soft delete prior row
        response = test_client.post(
            f'/mines/documents/{source_guid}/artifact',
            data=json.dumps(self._payload(source_guid, str(document.mine_guid), [])),
            content_type='application/json',
            headers=auth_headers['full_auth_header'],
        )
        response_json = json.loads(response.data.decode())
        assert response_json['counts']['deleted'] >= 1

    def test_register_non_table_artifact_type(self, test_client, auth_headers, setup_info):
        document = setup_info['document']
        source_guid = str(document.document_manager_guid)
        now_application_guid = str(uuid.uuid4())
        now_application_document_xref_guid = str(uuid.uuid4())

        payload = {
            'request_id': str(uuid.uuid4()),
            'source': {
                'pipeline': 'now_document_indexing',
                'version': 'v1',
                'sent_at': '2026-05-22T00:00:00Z',
            },
            'source_document_manager_guid': source_guid,
            'mine_guid': str(document.mine_guid),
            'context': {
                'now_application_guid': now_application_guid,
                'now_application_document_xref_guid': now_application_document_xref_guid,
            },
            'artifacts': [
                {
                    'type': 'image',
                    'artifact_id': 'img-1',
                    'page_number': 2,
                    'bounding_box': {'x': 10, 'y': 10, 'width': 90, 'height': 90},
                    'content': {
                        'description': 'Tailings map section'
                    },
                    'extractor': {'name': 'layout_extractor', 'version': 'v1'},
                }
            ],
        }

        response = test_client.post(
            f'/mines/documents/{source_guid}/artifact',
            data=json.dumps(payload),
            content_type='application/json',
            headers=auth_headers['full_auth_header'],
        )

        assert response.status_code == 200
        response_json = json.loads(response.data.decode())
        assert response_json['counts']['created'] == 1

        saved = MineDocumentArtifact.query.filter_by(
            mine_document_guid=document.mine_document_guid,
            artifact_type='image',
            artifact_id='img-1',
            deleted_ind=False,
        ).one_or_none()
        assert saved is not None
        assert saved.bounding_box == {'x': 10, 'y': 10, 'width': 90, 'height': 90}
        assert str(saved.now_application_guid) == now_application_guid
        assert str(saved.now_application_document_xref_guid) == now_application_document_xref_guid

    def test_register_artifact_rejected_row_includes_error(self, test_client, auth_headers, setup_info):
        document = setup_info['document']
        source_guid = str(document.document_manager_guid)

        payload = {
            'request_id': str(uuid.uuid4()),
            'source': {
                'pipeline': 'now_document_indexing',
                'version': 'v1',
                'sent_at': '2026-05-22T00:00:00Z',
            },
            'source_document_manager_guid': source_guid,
            'mine_guid': str(document.mine_guid),
            'artifacts': [
                {
                    'type': 'image',
                    'content': {'description': 'missing artifact_id'},
                    'extractor': {'name': 'layout_extractor', 'version': 'v1'},
                }
            ],
        }

        response = test_client.post(
            f'/mines/documents/{source_guid}/artifact',
            data=json.dumps(payload),
            content_type='application/json',
            headers=auth_headers['full_auth_header'],
        )

        assert response.status_code == 207
        response_json = json.loads(response.data.decode())
        assert response_json['status'] == 'partial'
        assert response_json['counts']['rejected'] == 1
        assert len(response_json['errors']) == 1
        assert response_json['errors'][0]['code'] == 'invalid_artifact'

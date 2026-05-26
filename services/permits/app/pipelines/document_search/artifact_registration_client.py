import logging
import os
import hashlib
import uuid
from datetime import datetime, timezone
from urllib.parse import quote

import requests
from oauthlib.oauth2 import BackendApplicationClient
from requests_oauthlib import OAuth2Session

logger = logging.getLogger(__name__)


def _core_api_base_url():
    return os.getenv('CORE_API_URL') or os.getenv('CORE_API_BASE_URL')


def _document_manager_base_url():
    return os.getenv('DOCUMENT_MANAGER_URL')


def _artifact_folder_prefix():
    return os.getenv('DOCUMENT_ARTIFACT_UPLOAD_FOLDER_PREFIX', 'permits/now')


def _build_oauth_session():
    client_id = os.getenv('PERMITS_CLIENT_ID')
    client_secret = os.getenv('PERMITS_CLIENT_SECRET')
    token_url = os.getenv('TOKEN_URL')

    if not client_id or not client_secret or not token_url:
        return None

    oauth_client = BackendApplicationClient(client_id=client_id)
    oauth_session = OAuth2Session(client=oauth_client)
    oauth_session.fetch_token(token_url=token_url, client_secret=client_secret)
    return oauth_session


def _extract_object_store_path(payload):
    if not isinstance(payload, dict):
        return None

    # Document Manager responses are not perfectly uniform across endpoints.
    # Accept direct and common nested variants.
    for key in ('object_store_path', 'objectStorePath'):
        value = payload.get(key)
        if value:
            return value

    nested_document = payload.get('document')
    if isinstance(nested_document, dict):
        for key in ('object_store_path', 'objectStorePath'):
            value = nested_document.get(key)
            if value:
                return value

    return None


def _upload_artifact_file(
    session,
    source_document_manager_guid,
    now_application_guid,
    artifact_id,
    upload_data,
):
    base_url = _document_manager_base_url()
    if not base_url:
        return None, 'skipped'

    file_bytes = upload_data.get('content_bytes')
    if not file_bytes:
        return None, 'skipped'

    file_name = upload_data.get('file_name') or f"{artifact_id}.bin"
    mime_type = upload_data.get('mime_type') or 'application/octet-stream'
    folder = upload_data.get('folder') or (
        f"{_artifact_folder_prefix().strip('/')}/{now_application_guid}/artifacts/{source_document_manager_guid}"
    )
    pretty_folder = upload_data.get('pretty_folder') or folder

    token = (session.token or {}).get('access_token')
    if not token:
        logger.warning('Skipping artifact upload for %s: no OAuth access token available.', artifact_id)
        return None, 'skipped'

    upload_headers = {
        'Authorization': f'Bearer {token}',
        'Upload-Length': str(len(file_bytes)),
        'Filename': quote(file_name),
        'Upload-Metadata': 'origin permits-artifact',
        'Upload-Protocol': 's3-multipart',
        'Folder': folder,
        'Pretty-Folder': pretty_folder,
        'Prettyfolder': pretty_folder,
        'Content-Type': 'application/json',
    }

    init_response = requests.post(
        f"{base_url.rstrip('/')}/documents",
        headers=upload_headers,
        timeout=30,
    )
    init_response.raise_for_status()

    upload_info = init_response.json() or {}
    artifact_document_manager_guid = upload_info.get('document_manager_guid')
    multipart_upload = upload_info.get('upload') or {}
    upload_id = multipart_upload.get('uploadId')
    upload_parts = sorted(multipart_upload.get('parts') or [], key=lambda p: p.get('part', 0))
    if not artifact_document_manager_guid or not upload_id or not upload_parts:
        raise ValueError('Document Manager upload initialization did not return multipart parts.')

    offset = 0
    completed_parts = []
    for part in upload_parts:
        part_number = int(part.get('part'))
        part_size = int(part.get('size'))
        part_url = part.get('url')
        if not part_url:
            raise ValueError(f'Missing multipart URL for part {part_number}.')

        chunk = file_bytes[offset:offset + part_size]
        offset += part_size
        put_response = requests.put(
            part_url,
            data=chunk,
            timeout=60,
        )
        put_response.raise_for_status()
        etag = put_response.headers.get('etag') or put_response.headers.get('ETag')
        if not etag:
            raise ValueError(f'Missing ETag for uploaded part {part_number}.')
        completed_parts.append({'part': part_number, 'etag': etag})

    complete_headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    }
    complete_payload = {
        'upload_id': upload_id,
        'parts': completed_parts,
    }
    complete_response = requests.patch(
        f"{base_url.rstrip('/')}/documents/{artifact_document_manager_guid}/complete-upload",
        headers=complete_headers,
        json=complete_payload,
        timeout=30,
    )
    complete_response.raise_for_status()

    try:
        complete_info = complete_response.json() or {}
    except Exception:  # noqa: BLE001 - defensive parsing for non-json responses
        complete_info = {}
    object_store_path = (
        _extract_object_store_path(upload_info)
        or _extract_object_store_path(complete_info)
    )


    return {
        'document_manager_guid': artifact_document_manager_guid,
        'document_name': file_name,
        'mime_type': mime_type,
        'sha256': hashlib.sha256(file_bytes).hexdigest(),
        'object_store_path': object_store_path,
    }, 'uploaded'


def register_document_artifacts(
    source_document_manager_guid,
    mine_guid,
    now_application_guid,
    artifacts,
    now_application_document_xref_guid=None,
    request_id=None,
    include_upload_stats=False,
):
    upload_stats = {
        'candidates': sum(1 for artifact in (artifacts or []) if (artifact or {}).get('_artifact_upload')),
        'uploaded': 0,
        'skipped': 0,
        'failed': 0,
    }
    artifact_documents = []

    base_url = _core_api_base_url()
    if not base_url:
        logger.info('Skipping artifact registration callback: CORE_API_URL/CORE_API_BASE_URL not configured.')
        if include_upload_stats:
            upload_stats['skipped'] = upload_stats['candidates']
            return {'callback': None, 'upload_stats': upload_stats, 'artifact_documents': artifact_documents}
        return None

    session = _build_oauth_session()
    if not session:
        logger.info('Skipping artifact registration callback: OAuth client credentials are not configured.')
        if include_upload_stats:
            upload_stats['skipped'] = upload_stats['candidates']
            return {'callback': None, 'upload_stats': upload_stats, 'artifact_documents': artifact_documents}
        return None

    callback_request_id = request_id or str(uuid.uuid4())
    sent_at = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    callback_artifacts = []
    for artifact in artifacts or []:
        callback_artifact = dict(artifact)
        artifact_id = callback_artifact.get('artifact_id')
        upload_data = callback_artifact.pop('_artifact_upload', None)
        if upload_data:
            try:
                uploaded_artifact, upload_state = _upload_artifact_file(
                    session=session,
                    source_document_manager_guid=source_document_manager_guid,
                    now_application_guid=now_application_guid,
                    artifact_id=artifact_id or 'artifact',
                    upload_data=upload_data,
                )
                upload_stats[upload_state] += 1
                if uploaded_artifact:
                    callback_artifact['artifact'] = {
                        **(callback_artifact.get('artifact') or {}),
                        **uploaded_artifact,
                    }
                    if artifact_id and uploaded_artifact.get('document_manager_guid'):
                        artifact_documents.append(
                            {
                                'artifact_id': artifact_id,
                                'document_manager_guid': uploaded_artifact.get('document_manager_guid'),
                                'object_store_path': uploaded_artifact.get('object_store_path'),
                                'mime_type': uploaded_artifact.get('mime_type'),
                            }
                        )
            except Exception as exc:  # noqa: BLE001 - best-effort artifact upload
                upload_stats['failed'] += 1
                logger.warning(
                    'Artifact file upload failed for source_document_manager_guid=%s artifact_id=%s: %s',
                    source_document_manager_guid,
                    callback_artifact.get('artifact_id'),
                    exc,
                )
        callback_artifacts.append(callback_artifact)

    payload = {
        'request_id': callback_request_id,
        'source': {
            'pipeline': 'now_document_indexing',
            'version': 'v1',
            'sent_at': sent_at,
        },
        'source_document_manager_guid': source_document_manager_guid,
        'mine_guid': mine_guid,
        'context': {
            'now_application_guid': now_application_guid,
            'now_application_document_xref_guid': now_application_document_xref_guid,
        },
        'artifacts': callback_artifacts,
    }

    endpoint = f"{base_url.rstrip('/')}/mines/documents/{source_document_manager_guid}/artifact"
    try:
        response = session.post(endpoint, json=payload, timeout=30)
        response.raise_for_status()
        callback_result = response.json()
        if include_upload_stats:
            return {
                'callback': callback_result,
                'upload_stats': upload_stats,
                'artifact_documents': artifact_documents,
            }
        return callback_result
    except requests.RequestException as exc:
        logger.warning('Artifact registration callback failed for source_document_manager_guid=%s: %s',
                       source_document_manager_guid, exc)
        if include_upload_stats:
            return {'callback': None, 'upload_stats': upload_stats, 'artifact_documents': artifact_documents}
        return None

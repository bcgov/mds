import hashlib
import logging
import os
from urllib.parse import quote

import requests
from app.pipelines.document_search.permits_oauth_session_helper import build_permits_oauth_session

logger = logging.getLogger(__name__)


def _document_manager_base_url():
    return os.getenv('DOCUMENT_MANAGER_URL')


def _artifact_folder_prefix():
    return os.getenv('DOCUMENT_ARTIFACT_UPLOAD_FOLDER_PREFIX', 'permits/now')



class DocumentManagerArtifactUploader:
    def __init__(self, session, base_url=None):
        self.session = session
        self.base_url = (base_url or _document_manager_base_url() or '').rstrip('/')

    def upload(self, source_document_manager_guid, now_application_guid, artifact_id, upload_data):
        """
        Upload artifact binary to Document Manager using multipart upload, and return artifact document metadata.
        """


        if not self.base_url:
            return None, 'skipped'

        file_bytes = upload_data.get('content_bytes')
        if not file_bytes:
            return None, 'skipped'

        token = (self.session.token or {}).get('access_token')
        if not token:
            logger.warning('Skipping artifact upload for %s: no OAuth access token available.', artifact_id)
            return None, 'skipped'

        file_name = upload_data.get('file_name') or f"{artifact_id}.bin"
        mime_type = upload_data.get('mime_type') or 'application/octet-stream'
        upload_info = self._initialize_upload(
            token,
            file_bytes,
            file_name,
            self._resolve_folder(upload_data, now_application_guid, source_document_manager_guid),
        )
        artifact_document_manager_guid, upload_id, upload_parts = self._parse_upload_info(upload_info)
        completed_parts = self._upload_parts(file_bytes, upload_parts)
        complete_info = self._complete_upload(token, artifact_document_manager_guid, upload_id, completed_parts)
        logger.info(
            'Artifact complete-upload raw response artifact_id=%s document_manager_guid=%s completed_parts=%s complete_info=%s',
            artifact_id,
            artifact_document_manager_guid,
            completed_parts,
            complete_info,
        )

        return {
            'document_manager_guid': artifact_document_manager_guid,
            'document_name': file_name,
            'mime_type': mime_type,
            'sha256': hashlib.sha256(file_bytes).hexdigest(),
        }, 'uploaded'

    def _resolve_folder(self, upload_data, now_application_guid, source_document_manager_guid):
        folder = upload_data.get('folder') or (
            f"{_artifact_folder_prefix().strip('/')}/{now_application_guid}/artifacts/{source_document_manager_guid}"
        )
        pretty_folder = upload_data.get('pretty_folder') or folder
        return folder, pretty_folder

    def _initialize_upload(self, token, file_bytes, file_name, folders):
        folder, pretty_folder = folders
        response = requests.post(
            f"{self.base_url}/documents",
            headers={
                'Authorization': f'Bearer {token}',
                'Upload-Length': str(len(file_bytes)),
                'Filename': quote(file_name),
                'Upload-Metadata': 'origin permits-artifact',
                'Upload-Protocol': 's3-multipart',
                'Folder': folder,
                'Pretty-Folder': pretty_folder,
                'Prettyfolder': pretty_folder,
                'Content-Type': 'application/json',
            },
            timeout=30,
        )
        response.raise_for_status()
        return response.json() or {}

    @staticmethod
    def _parse_upload_info(upload_info):
        artifact_document_manager_guid = upload_info.get('document_manager_guid')
        multipart_upload = upload_info.get('upload') or {}
        upload_id = multipart_upload.get('uploadId')
        upload_parts = sorted(multipart_upload.get('parts') or [], key=lambda p: p.get('part', 0))
        if not artifact_document_manager_guid or not upload_id or not upload_parts:
            raise ValueError('Document Manager upload initialization did not return multipart parts.')
        return artifact_document_manager_guid, upload_id, upload_parts

    @staticmethod
    def _upload_parts(file_bytes, upload_parts):
        offset = 0
        completed_parts = []
        for part in upload_parts:
            part_number = int(part.get('part'))
            part_size = int(part.get('size'))
            part_url = part.get('url')
            if not part_url:
                raise ValueError(f'Missing multipart URL for part {part_number}.')
            response = requests.put(part_url, data=file_bytes[offset:offset + part_size], timeout=60)
            response.raise_for_status()
            offset += part_size
            etag = response.headers.get('etag') or response.headers.get('ETag')
            if not etag:
                raise ValueError(f'Missing ETag for uploaded part {part_number}.')
            completed_parts.append({'part': part_number, 'etag': etag})
        return completed_parts

    def _complete_upload(self, token, artifact_document_manager_guid, upload_id, completed_parts):
        response = requests.patch(
            f"{self.base_url}/documents/{artifact_document_manager_guid}/complete-upload",
            headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
            json={'upload_id': upload_id, 'parts': completed_parts},
            timeout=30,
        )
        response.raise_for_status()
        try:
            return response.json() or {}
        except ValueError:
            return {}

def _upload_artifact_file_with_stats(
    uploader,
    source_document_manager_guid,
    now_application_guid,
    artifact_id,
    upload_data,
    upload_stats,
):
    """Upload one artifact binary and apply upload-state counters."""
    try:
        uploaded_artifact, upload_state = uploader.upload(
            source_document_manager_guid,
            now_application_guid,
            artifact_id,
            upload_data,
        )
        upload_stats[upload_state] += 1
        return uploaded_artifact
    except Exception as exc:
        upload_stats['failed'] += 1
        logger.warning(
            'Artifact file upload failed for source_document_manager_guid=%s artifact_id=%s: %s',
            source_document_manager_guid,
            artifact_id,
            exc,
        )
        return None


def _upload_callback_artifact(
    session,
    source_document_manager_guid,
    now_application_guid,
    callback_artifact,
    upload_stats,
):
    """Upload one callback artifact if binary payload is present.

    Returns uploaded artifact metadata to attach to callback payload, or None.
    """
    artifact_id = callback_artifact.get('artifact_id')
    upload_data = callback_artifact.pop('_artifact_upload', None)
    if not upload_data:
        return None

    uploader = DocumentManagerArtifactUploader(session)
    uploaded_artifact = _upload_artifact_file_with_stats(
        uploader=uploader,
        source_document_manager_guid=source_document_manager_guid,
        now_application_guid=now_application_guid,
        artifact_id=artifact_id or 'artifact',
        upload_data=upload_data,
        upload_stats=upload_stats,
    )
    # Only return attachable metadata when artifact_id is known.
    if not artifact_id or not uploaded_artifact:
        return None
    return uploaded_artifact


def _registration_result(callback, upload_stats, artifact_documents, include_upload_stats):
    if include_upload_stats:
        return {
            'callback': callback,
            'upload_stats': upload_stats,
            'artifact_documents': artifact_documents,
        }
    return callback


def _skipped_registration(upload_stats, artifact_documents, include_upload_stats):
    upload_stats['skipped'] = upload_stats['candidates']
    return _registration_result(None, upload_stats, artifact_documents, include_upload_stats)


def _prepare_callback_artifacts(
    *,
    session,
    source_document_manager_guid,
    now_application_guid,
    artifacts,
    upload_stats,
):
    callback_artifacts = []
    artifact_documents = []
    for artifact in artifacts or []:
        callback_artifact = dict(artifact)
        uploaded_artifact = _upload_callback_artifact(
            session,
            source_document_manager_guid,
            now_application_guid,
            callback_artifact,
            upload_stats,
        )
        if uploaded_artifact:
            _attach_uploaded_artifact(callback_artifact, uploaded_artifact)
            artifact_documents.append(_artifact_document_summary(callback_artifact['artifact_id'], uploaded_artifact))
        callback_artifacts.append(callback_artifact)
    return callback_artifacts, artifact_documents


def _attach_uploaded_artifact(callback_artifact, uploaded_artifact):
    callback_artifact['artifact'] = {
        **(callback_artifact.get('artifact') or {}),
        **uploaded_artifact,
    }


def _artifact_document_summary(artifact_id, uploaded_artifact):
    return {
        'artifact_id': artifact_id,
        'document_manager_guid': uploaded_artifact.get('document_manager_guid'),
        'object_store_path': uploaded_artifact.get('object_store_path'),
        'mime_type': uploaded_artifact.get('mime_type'),
    }


def upload_document_artifacts(
    source_document_manager_guid,
    mine_guid,
    now_application_guid,
    artifacts,
    now_application_document_xref_guid=None,
    request_id=None,
    include_upload_stats=False,
):
    """Upload extracted artifact binaries to Document Manager and return upload metadata.

    This function uploads each artifact's `_artifact_upload` payload to the
    Document Manager folder:
    `<DOCUMENT_ARTIFACT_UPLOAD_FOLDER_PREFIX>/<now_application_guid>/artifacts/<source_document_manager_guid>`.
    """
    upload_stats = {
        'candidates': sum(1 for artifact in (artifacts or []) if (artifact or {}).get('_artifact_upload')),
        'uploaded': 0,
        'skipped': 0,
        'failed': 0,
    }
    artifact_documents = []

    logger.info(
        'Artifact upload plan: candidates=%s document_manager_url=%s folder_prefix=%s source_document_manager_guid=%s now_application_guid=%s',
        upload_stats['candidates'],
        _document_manager_base_url(),
        _artifact_folder_prefix(),
        source_document_manager_guid,
        now_application_guid,
    )

    session = build_permits_oauth_session()
    if not session:
        logger.info('Skipping artifact upload: OAuth client credentials are not configured.')
        return _skipped_registration(upload_stats, artifact_documents, include_upload_stats)

    _callback_artifacts, artifact_documents = _prepare_callback_artifacts(
        session=session,
        source_document_manager_guid=source_document_manager_guid,
        now_application_guid=now_application_guid,
        artifacts=artifacts,
        upload_stats=upload_stats,
    )

    _ = mine_guid, now_application_document_xref_guid, request_id, _callback_artifacts
    return _registration_result(None, upload_stats, artifact_documents, include_upload_stats)

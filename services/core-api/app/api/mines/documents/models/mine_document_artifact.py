import hashlib
import json

from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base, SoftDeleteMixin
from app.extensions import db


class MineDocumentArtifact(SoftDeleteMixin, AuditMixin, Base):
    __tablename__ = 'mine_document_artifact'

    mine_document_artifact_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    mine_document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('mine_document.mine_document_guid'), nullable=False)
    source_document_manager_guid = db.Column(UUID(as_uuid=True), nullable=False)

    artifact_type = db.Column(db.String, nullable=False)
    artifact_id = db.Column(db.String, nullable=False)
    page_number = db.Column(db.Integer)
    bounding_box = db.Column(JSONB(astext_type=db.Text()))
    now_application_guid = db.Column(UUID(as_uuid=True))
    now_application_document_xref_guid = db.Column(UUID(as_uuid=True))

    content = db.Column(JSONB(astext_type=db.Text()), nullable=False)
    artifact_metadata = db.Column('metadata', JSONB(astext_type=db.Text()))

    artifact_document_manager_guid = db.Column(UUID(as_uuid=True))
    artifact_document_name = db.Column(db.String)
    artifact_mime_type = db.Column(db.String)
    artifact_sha256 = db.Column(db.String)

    extractor_name = db.Column(db.String, nullable=False)
    extractor_version = db.Column(db.String, nullable=False)
    payload_hash = db.Column(db.String, nullable=False)

    mine_document = db.relationship(
        'MineDocument',
        lazy='select',
        back_populates='artifacts',
    )

    @staticmethod
    def _payload_hash(artifact_payload: dict) -> str:
        canonical = json.dumps(artifact_payload, sort_keys=True, separators=(',', ':'), default=str)
        return hashlib.sha256(canonical.encode('utf-8')).hexdigest()

    @classmethod
    def find_active_by_natural_key(cls, mine_document_guid, artifact_type, artifact_id, extractor_version):
        return cls.query.filter_by(
            mine_document_guid=mine_document_guid,
            artifact_type=artifact_type,
            artifact_id=artifact_id,
            extractor_version=extractor_version,
            deleted_ind=False,
        ).one_or_none()

    @classmethod
    def find_active_by_mine_document_and_versions(cls, mine_document_guid, extractor_versions):
        if not extractor_versions:
            return []
        return cls.query.filter(
            cls.mine_document_guid == mine_document_guid,
            cls.extractor_version.in_(list(extractor_versions)),
            cls.deleted_ind == False,
        ).all()

    @classmethod
    def register_artifacts(
        cls,
        mine_document,
        source_document_manager_guid,
        artifacts,
        source_version,
        context,
        username,
    ):
        counts = {
            'created': 0,
            'updated': 0,
            'unchanged': 0,
            'deleted': 0,
            'rejected': 0,
        }

        seen_artifact_ids_by_version_type = {}
        seen_types_by_version = {}
        extractor_versions = set()
        errors = []
        context = context or {}

        for index, item in enumerate(artifacts):
            extractor = item.get('extractor') or {}
            extractor_version = extractor.get('version')
            artifact_type = item.get('type') or 'table'
            artifact_id = item.get('artifact_id') or item.get('table_id')

            if not extractor_version or not artifact_id:
                counts['rejected'] += 1
                errors.append({
                    'index': index,
                    'code': 'invalid_artifact',
                    'message': 'Artifact requires extractor.version and artifact_id (or table_id for legacy table payloads).',
                })
                continue

            extractor_versions.add(extractor_version)
            seen_types_by_version.setdefault(extractor_version, set()).add(artifact_type)
            seen_artifact_ids_by_version_type.setdefault((extractor_version, artifact_type), set()).add(artifact_id)

            payload_hash = cls._payload_hash(item)
            artifact = item.get('artifact') or {}
            content = item.get('content')
            if content is None:
                # Backward compatibility for table-specific payload shape.
                content = {
                    'table_index': item.get('table_index'),
                    'caption': item.get('caption'),
                    'footnotes': item.get('footnotes') or [],
                    'headers': item.get('headers') or [],
                    'rows': item.get('rows') or [],
                    'markdown': item.get('markdown'),
                }

            existing = cls.find_active_by_natural_key(
                mine_document_guid=mine_document.mine_document_guid,
                artifact_type=artifact_type,
                artifact_id=artifact_id,
                extractor_version=extractor_version,
            )

            if not existing:
                record = cls(
                    mine_document_guid=mine_document.mine_document_guid,
                    source_document_manager_guid=source_document_manager_guid,
                    artifact_type=artifact_type,
                    artifact_id=artifact_id,
                    page_number=item.get('page_number'),
                    bounding_box=item.get('bounding_box'),
                    now_application_guid=context.get('now_application_guid'),
                    now_application_document_xref_guid=context.get('now_application_document_xref_guid'),
                    content=content,
                    artifact_metadata=item.get('metadata') or {},
                    artifact_document_manager_guid=artifact.get('document_manager_guid'),
                    artifact_document_name=artifact.get('document_name'),
                    artifact_mime_type=artifact.get('mime_type'),
                    artifact_sha256=artifact.get('sha256'),
                    extractor_name=extractor.get('name'),
                    extractor_version=extractor_version,
                    payload_hash=payload_hash,
                    create_user=username,
                    update_user=username,
                )
                db.session.add(record)
                counts['created'] += 1
                continue

            if existing.payload_hash == payload_hash:
                counts['unchanged'] += 1
                continue

            existing.source_document_manager_guid = source_document_manager_guid
            existing.page_number = item.get('page_number')
            existing.bounding_box = item.get('bounding_box')
            existing.now_application_guid = context.get('now_application_guid')
            existing.now_application_document_xref_guid = context.get('now_application_document_xref_guid')
            existing.content = content
            existing.artifact_metadata = item.get('metadata') or {}
            existing.artifact_document_manager_guid = artifact.get('document_manager_guid')
            existing.artifact_document_name = artifact.get('document_name')
            existing.artifact_mime_type = artifact.get('mime_type')
            existing.artifact_sha256 = artifact.get('sha256')
            existing.extractor_name = extractor.get('name')
            existing.payload_hash = payload_hash
            existing.update_user = username
            counts['updated'] += 1

        if not extractor_versions and source_version:
            extractor_versions.add(source_version)
            seen_types_by_version[source_version] = set()

        existing_rows = cls.find_active_by_mine_document_and_versions(
            mine_document_guid=mine_document.mine_document_guid,
            extractor_versions=extractor_versions,
        )

        for row in existing_rows:
            applicable_types = seen_types_by_version.get(row.extractor_version)
            if applicable_types is None:
                continue
            if applicable_types and row.artifact_type not in applicable_types:
                continue

            valid_artifact_ids = seen_artifact_ids_by_version_type.get(
                (row.extractor_version, row.artifact_type),
                set(),
            )
            if row.artifact_id not in valid_artifact_ids:
                row.deleted_ind = True
                row.update_user = username
                counts['deleted'] += 1

        return counts, errors

    @classmethod
    def register_tables(cls, mine_document, source_document_manager_guid, tables, username):
        counts, _ = cls.register_artifacts(
            mine_document=mine_document,
            source_document_manager_guid=source_document_manager_guid,
            artifacts=tables,
            source_version=None,
            context=None,
            username=username,
        )
        return counts


MineDocumentTableArtifact = MineDocumentArtifact
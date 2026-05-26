from flask_restx import fields
from app.extensions import api

CREATE_DOCUMENT_VERSION = api.model('MineDocumentVersionCreate', {
    'document_manager_version_guid': fields.String
})

ARTIFACT_BLOB_MODEL = api.model('ArtifactBlob', {
    'document_manager_guid': fields.String,
    'document_name': fields.String,
    'mime_type': fields.String,
    'sha256': fields.String,
})

ARTIFACT_EXTRACTOR_MODEL = api.model('ArtifactExtractor', {
    'name': fields.String(required=True),
    'version': fields.String(required=True),
})

TABLE_EXTRACTION_ROW_MODEL = api.model('TableExtractionRow', {
    'table_id': fields.String(required=True),
    'page_number': fields.Integer(required=True),
    'bounding_box': fields.Raw(description='Page-relative bounding box for this artifact'),
    'table_index': fields.Integer(required=True),
    'caption': fields.String,
    'footnotes': fields.List(fields.String),
    'headers': fields.List(fields.String),
    'rows': fields.List(fields.Raw, required=True),
    'markdown': fields.String,
    'metadata': fields.Raw,
    'artifact': fields.Nested(ARTIFACT_BLOB_MODEL),
    'extractor': fields.Nested(ARTIFACT_EXTRACTOR_MODEL, required=True),
})

EXTRACTED_ARTIFACT_MODEL = api.model('ExtractedArtifact', {
    'type': fields.String(required=True, description='Artifact type, for example table/image/figure'),
    'artifact_id': fields.String(required=True, description='Stable artifact identifier within a source document'),
    'page_number': fields.Integer,
    'bounding_box': fields.Raw(description='Page-relative bounding box for this artifact'),
    'content': fields.Raw(required=True, description='Type-specific extracted content payload'),
    'metadata': fields.Raw,
    'artifact': fields.Nested(ARTIFACT_BLOB_MODEL),
    'extractor': fields.Nested(ARTIFACT_EXTRACTOR_MODEL, required=True),
})

TABLE_EXTRACTION_SOURCE_MODEL = api.model('TableExtractionSource', {
    'pipeline': fields.String(required=True),
    'version': fields.String(required=True),
    'sent_at': fields.String(required=True),
})

TABLE_EXTRACTION_CONTEXT_MODEL = api.model('TableExtractionContext', {
    'now_application_guid': fields.String,
    'now_application_document_xref_guid': fields.String,
})

REGISTER_DOCUMENT_ARTIFACTS = api.model('RegisterDocumentArtifacts', {
    'request_id': fields.String(required=True),
    'source': fields.Nested(TABLE_EXTRACTION_SOURCE_MODEL, required=True),
    'source_document_manager_guid': fields.String,
    'mine_guid': fields.String(required=True),
    'context': fields.Nested(TABLE_EXTRACTION_CONTEXT_MODEL),
    'artifacts': fields.List(fields.Nested(EXTRACTED_ARTIFACT_MODEL), required=False),
    'tables': fields.List(fields.Nested(TABLE_EXTRACTION_ROW_MODEL), required=False),
})

# Backward compatibility for callers and imports not yet migrated.
REGISTER_TABLE_ARTIFACTS = REGISTER_DOCUMENT_ARTIFACTS

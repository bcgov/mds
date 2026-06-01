CREATE TABLE IF NOT EXISTS mine_document_artifact (
    mine_document_artifact_guid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_document_guid UUID NOT NULL REFERENCES mine_document(mine_document_guid),
    source_document_manager_guid UUID NOT NULL,

    artifact_type character varying(100) NOT NULL,
    artifact_id character varying(255) NOT NULL,
    page_number integer,
    bounding_box jsonb,
    now_application_guid UUID,
    now_application_document_xref_guid UUID,

    content jsonb NOT NULL,
    metadata jsonb,

    artifact_document_manager_guid UUID,
    artifact_document_name character varying(255),
    artifact_mime_type character varying(100),
    artifact_sha256 character varying(128),

    extractor_name character varying(100) NOT NULL,
    extractor_version character varying(100) NOT NULL,
    payload_hash character varying(128) NOT NULL,

    deleted_ind boolean DEFAULT false NOT NULL,
    create_user character varying(60) NOT NULL,
    update_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_mdta_mine_document_guid
    ON mine_document_artifact (mine_document_guid)
    WHERE deleted_ind = false;

CREATE INDEX IF NOT EXISTS idx_mdta_source_document_manager_guid
    ON mine_document_artifact (source_document_manager_guid)
    WHERE deleted_ind = false;

CREATE INDEX IF NOT EXISTS idx_mdta_natural_key
    ON mine_document_artifact (mine_document_guid, artifact_type, artifact_id, extractor_version)
    WHERE deleted_ind = false;
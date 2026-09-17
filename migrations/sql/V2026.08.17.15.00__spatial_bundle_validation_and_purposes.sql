-- Shared spatial bundle validation fields
ALTER TABLE mine_document_bundle
    ADD COLUMN IF NOT EXISTS validation_status VARCHAR(30),
    ADD COLUMN IF NOT EXISTS validation_error VARCHAR(1000),
    ADD COLUMN IF NOT EXISTS validation_checks JSONB;

COMMENT ON COLUMN mine_document_bundle.validation_status IS
    'VALID | INVALID | UNABLE_TO_VALIDATE';

-- Reusable purpose / flag codes for spatial bundles (e.g. Mine Boundary)
CREATE TABLE IF NOT EXISTS spatial_bundle_purpose_code (
    spatial_bundle_purpose_code VARCHAR(3) PRIMARY KEY,
    description                 VARCHAR(100) NOT NULL,
    display_order               INTEGER NOT NULL DEFAULT 0,
    active_ind                  BOOLEAN NOT NULL DEFAULT TRUE,
    create_user                 VARCHAR(60) NOT NULL,
    create_timestamp            TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    update_user                 VARCHAR(60) NOT NULL,
    update_timestamp            TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS mine_document_bundle_purpose_xref (
    bundle_id                   INTEGER NOT NULL
        REFERENCES mine_document_bundle(bundle_id),
    spatial_bundle_purpose_code VARCHAR(3) NOT NULL
        REFERENCES spatial_bundle_purpose_code(spatial_bundle_purpose_code),
    create_user                 VARCHAR(60) NOT NULL,
    create_timestamp            TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    update_user                 VARCHAR(60) NOT NULL,
    update_timestamp            TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    PRIMARY KEY (bundle_id, spatial_bundle_purpose_code)
);

INSERT INTO spatial_bundle_purpose_code (
    spatial_bundle_purpose_code, description, display_order, active_ind,
    create_user, update_user
)
VALUES (
    'MBD', 'Mine Boundary', 10, TRUE, 'system', 'system'
)
ON CONFLICT (spatial_bundle_purpose_code) DO NOTHING;

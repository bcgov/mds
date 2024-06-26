CREATE TABLE IF NOT EXISTS mine_document_bundle (
    bundle_id UUID PRIMARY KEY,
    bundle_guid UUID NOT NULL,
    create_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    create_user VARCHAR(60) NOT NULL,
    update_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    deleted_ind BOOLEAN DEFAULT FALSE NOT NULL,
    name VARCHAR(300) NOT NULL,
    geomark_link VARCHAR(300),
    docman_bundle_guid UUID NOT NULL
);
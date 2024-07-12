-- Add a new SERIAL column
ALTER TABLE mine_document_bundle ADD COLUMN bundle_id_new SERIAL;

-- Drop the old column
ALTER TABLE mine_document_bundle DROP COLUMN bundle_id;

-- Rename the new column to old column
ALTER TABLE mine_document_bundle RENAME COLUMN bundle_id_new TO bundle_id;

-- Adjust the primary key after the column type change
ALTER TABLE mine_document_bundle ADD PRIMARY KEY (bundle_id);

ALTER TABLE mine_document
ADD COLUMN mine_document_bundle_id INTEGER REFERENCES mine_document_bundle(bundle_id);

ALTER TABLE mine_document_bundle
    ALTER COLUMN bundle_guid SET DEFAULT gen_random_uuid(),
    ADD COLUMN update_user VARCHAR(60) NOT NULL;
--wanted to rename, just going to create new, this table will be in the mine microservice, so using mine prefix.
CREATE TABLE mine_required_document_category (
    req_document_category character varying(3) PRIMARY KEY,
    description character varying(300),
    active_ind boolean DEFAULT true NOT NULL
);

INSERT INTO mine_required_document_category
    (
    req_document_category,
    description
    )
VALUES
    ('TSF', 'Code required documents for mines with Tailings Storage Factilies'),
    ('OTH', 'Other...')
ON CONFLICT DO NOTHING;
ALTER TABLE mine_required_document_category OWNER TO mds;

--add new col and fk to this table
ALTER TABLE mds_required_document ADD COLUMN IF NOT EXISTS req_document_category character varying(3);
ALTER TABLE ONLY mds_required_document ADD CONSTRAINT mine_required_document_category_fkey FOREIGN KEY (req_document_category) REFERENCES mine_required_document_category(req_document_category) DEFERRABLE INITIALLY DEFERRED;

--map guids to string PK 
UPDATE mds_required_document SET req_document_category = 'TSF' WHERE req_document_category_guid = '6ab98b9a-0e66-4f26-99de-e3c270dea7b6';
UPDATE mds_required_document SET req_document_category = 'OTH' WHERE req_document_category_guid = '6ab98b9a-0e66-4f26-99de-e3c270dea7b7';

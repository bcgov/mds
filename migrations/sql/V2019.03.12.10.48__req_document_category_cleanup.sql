--remove old fk, col, and table
ALTER TABLE mds_required_document DROP CONSTRAINT if exists mds_required_document_req_document_category_guid_fkey;
ALTER TABLE mds_required_document DROP COLUMN IF EXISTS req_document_category_guid;

DROP TABLE IF EXISTS mds_required_document_category;

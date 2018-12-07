-- Mine Type
ALTER TABLE IF EXISTS mine_type
RENAME mine_tenure_type_id TO mine_tenure_type_code;

ALTER TABLE IF EXISTS mine_type
DROP CONSTRAINT mine_type_mine_tenure_type_id_fkey,
ALTER COLUMN mine_tenure_type_code TYPE character varying(3);

-- Mine Tenure Type
ALTER TABLE IF EXISTS mine_tenure_type
RENAME TO mine_tenure_type_code;

ALTER TABLE IF EXISTS mine_tenure_type_code
RENAME mine_tenure_type_id TO mine_tenure_type_code;

ALTER TABLE IF EXISTS mine_tenure_type_code
RENAME mine_tenure_type_name TO description;

ALTER TABLE IF EXISTS mine_tenure_type_code
ALTER COLUMN mine_tenure_type_code TYPE character varying(3);

-- Add foreign key and index to updated columns
ALTER TABLE mine_type
ADD FOREIGN KEY (mine_tenure_type_code) REFERENCES mine_tenure_type_code(mine_tenure_type_code) DEFERRABLE INITIALLY DEFERRED;

CREATE INDEX mine_type_tenure_type_code_idx ON mine_type (mine_tenure_type_code);

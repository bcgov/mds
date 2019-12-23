ALTER TABLE mine_incident DROP CONSTRAINT IF EXISTS mine_incident_mine_incident_category_code_fkey;
ALTER TABLE mine_incident DROP COLUMN IF EXISTS mine_incident_category_code;

DROP TABLE IF EXISTS mine_incident_category_codes;
CREATE TABLE mine_incident_category_codes (
    mine_incident_category_codes_id serial PRIMARY KEY,
    mine_incident_id integer NOT NULL,
    mine_incident_category_code character varying NOT NULL
);

ALTER TABLE mine_incident_category_codes OWNER TO mds;

COMMENT ON TABLE mine_incident_category_codes IS 'Contains the references to the one or many mine incident category codes that have been attached to a mine incident record.';

ALTER TABLE mine_incident_category_codes
    ADD CONSTRAINT mine_incident_category_codes_mine_incident_fkey FOREIGN KEY (mine_incident_id) REFERENCES mine_incident(mine_incident_id) ON DELETE CASCADE;

ALTER TABLE mine_incident_category_codes
    ADD CONSTRAINT mine_incident_category_codes_mine_incident_category_fkey FOREIGN KEY (mine_incident_category_code) REFERENCES mine_incident_category(mine_incident_category_code) ON DELETE CASCADE;
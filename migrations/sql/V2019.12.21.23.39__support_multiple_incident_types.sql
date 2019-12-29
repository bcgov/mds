ALTER TABLE mine_incident DROP CONSTRAINT IF EXISTS mine_incident_mine_incident_category_code_fkey;
ALTER TABLE mine_incident DROP COLUMN IF EXISTS mine_incident_category_code;

ALTER TABLE mine_incident_category ALTER COLUMN mine_incident_category_code TYPE varchar(3);
ALTER TABLE mine_incident_category DROP COLUMN IF EXISTS display_order;
ALTER TABLE mine_incident_category ADD COLUMN display_order integer;

UPDATE mine_incident_category
SET display_order = 0
WHERE mine_incident_category_code = 'ENV';

UPDATE mine_incident_category
SET display_order = 1
WHERE mine_incident_category_code = 'GTC';

UPDATE mine_incident_category
SET display_order = 2
WHERE mine_incident_category_code = 'H&S';

UPDATE mine_incident_category
SET display_order = 3
WHERE mine_incident_category_code = 'SPI';

DROP TABLE IF EXISTS mine_incident_category_xref;
CREATE TABLE mine_incident_category_xref (
    mine_incident_id integer NOT NULL,
    mine_incident_category_code varchar(3) NOT NULL,
    PRIMARY KEY(mine_incident_id, mine_incident_category_code)
);

ALTER TABLE mine_incident_category_xref OWNER TO mds;

COMMENT ON TABLE mine_incident_category_xref IS 'Contains the references to the one or many mine incident category codes that have been attached to a mine incident record.';

ALTER TABLE mine_incident_category_xref
    DROP CONSTRAINT IF EXISTS mine_incident_category_xref_mine_incident_fkey CASCADE;
ALTER TABLE mine_incident_category_xref
    ADD CONSTRAINT mine_incident_category_xref_mine_incident_fkey FOREIGN KEY (mine_incident_id) REFERENCES mine_incident(mine_incident_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE mine_incident_category_xref
    DROP CONSTRAINT IF EXISTS mine_incident_category_xref_mine_incident_category_fkey CASCADE;
ALTER TABLE mine_incident_category_xref
    ADD CONSTRAINT mine_incident_category_xref_mine_incident_category_fkey FOREIGN KEY (mine_incident_category_code) REFERENCES mine_incident_category(mine_incident_category_code) ON UPDATE CASCADE ON DELETE CASCADE;
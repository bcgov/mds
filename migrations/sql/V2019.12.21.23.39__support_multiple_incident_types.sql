
ALTER TABLE mine_incident_category ALTER COLUMN mine_incident_category_code TYPE varchar(3);

ALTER TABLE mine_incident_category DROP COLUMN IF EXISTS display_order;
ALTER TABLE mine_incident_category ADD COLUMN display_order integer NOT NULL DEFAULT 0;

UPDATE mine_incident_category
SET display_order = 10
WHERE mine_incident_category_code = 'ENV';

UPDATE mine_incident_category
SET display_order = 20
WHERE mine_incident_category_code = 'GTC';

UPDATE mine_incident_category
SET display_order = 30
WHERE mine_incident_category_code = 'H&S';

UPDATE mine_incident_category
SET display_order = 40
WHERE mine_incident_category_code = 'SPI';

ALTER TABLE mine_incident_category ALTER COLUMN display_order DROP DEFAULT;

DROP TABLE IF EXISTS mine_incident_category_xref;
CREATE TABLE mine_incident_category_xref (
    mine_incident_id integer NOT NULL,
    mine_incident_category_code varchar(3) NOT NULL,
    PRIMARY KEY(mine_incident_id, mine_incident_category_code)
);

ALTER TABLE mine_incident_category_xref OWNER TO mds;

COMMENT ON TABLE mine_incident_category_xref IS 'Contains the references to the one or many mine incident category codes that have been attached to a mine incident record.';

INSERT INTO mine_incident_category_xref
    SELECT  mi.mine_incident_id, mi.mine_incident_category_code FROM mine_incident mi where mi.mine_incident_category_code is not null;

ALTER TABLE mine_incident_category_xref
    DROP CONSTRAINT IF EXISTS mine_incident_category_xref_mine_incident_fkey CASCADE;
ALTER TABLE mine_incident_category_xref
    ADD CONSTRAINT mine_incident_category_xref_mine_incident_fkey FOREIGN KEY (mine_incident_id) REFERENCES mine_incident(mine_incident_id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE mine_incident_category_xref
    DROP CONSTRAINT IF EXISTS mine_incident_category_xref_mine_incident_category_fkey CASCADE;
ALTER TABLE mine_incident_category_xref
    ADD CONSTRAINT mine_incident_category_xref_mine_incident_category_fkey FOREIGN KEY (mine_incident_category_code) REFERENCES mine_incident_category(mine_incident_category_code) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE mine_incident DROP CONSTRAINT IF EXISTS mine_incident_mine_incident_category_code_fkey;
ALTER TABLE mine_incident DROP COLUMN IF EXISTS mine_incident_category_code;
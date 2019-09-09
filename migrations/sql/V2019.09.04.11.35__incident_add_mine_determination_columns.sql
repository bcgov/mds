ALTER TABLE mine_incident
ADD COLUMN mine_determination_representative character varying(255),
ADD COLUMN mine_determination_type_code character varying(3),
ADD CONSTRAINT mine_incident_mine_determination_fkey
    FOREIGN KEY (mine_determination_type_code)
    REFERENCES mine_incident_determination_type(mine_incident_determination_type_code);

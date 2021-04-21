-- Changed "EMPR staff" to "Ministry staff"
COMMENT ON TABLE mine_verified_status IS 'To aid the assurance of a mine''s data quality, this table is used to show whether or not the mine is verified to be correct (such as mine name, associated parties, etc.). This is determined by Ministry staff and a flag is set within the Core application.';

-- Changed "business with EMPR" to "business with the Ministry"
COMMENT ON TABLE party IS 'Party references an individual or an organization that does business with the Ministry, and any relevant contact information, such as address.';

-- Changed from "lookup table for the types of EMPR reactions to a given mine_incident."
COMMENT ON TABLE mine_incident_followup_investigation_type IS 'Lookup table for the types of Ministry reactions to a given mine incident.';

ALTER TABLE mine ADD COLUMN IF NOT EXISTS
    mine_timezone varchar(50);
ALTER TABLE mine_incident ADD COLUMN IF NOT EXISTS
    incident_timezone varchar(50);
ALTER TABLE mine_incident ADD COLUMN IF NOT EXISTS
    tz_legacy boolean DEFAULT false;

UPDATE mine_incident SET tz_legacy = true;
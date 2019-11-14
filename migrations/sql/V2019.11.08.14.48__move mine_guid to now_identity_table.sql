ALTER TABLE now_application DROP COLUMN mine_guid;
ALTER TABLE now_application_identity ADD COLUMN mine_guid UUID REFERENCES mine(mine_guid);

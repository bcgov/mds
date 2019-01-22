ALTER TABLE mine_party_appt
ALTER COLUMN processed_by DROP NOT NULL;

ALTER TABLE mine_party_appt
ALTER COLUMN processed_by SET DEFAULT NULL;

COMMENT ON COLUMN mine_party_appt.processed_by IS 'User who created the party appointment. For the purpose of external change logs.';
COMMENT ON COLUMN mine_party_appt.processed_on IS 'Party appointment created-at timestamp. For the purpose of external change logs.';

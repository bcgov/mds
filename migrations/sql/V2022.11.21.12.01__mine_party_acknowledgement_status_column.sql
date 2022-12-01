CREATE TYPE mine_party_acknowledgement_status AS ENUM (
    'acknowledged',
    'not_acknowledged'
);

ALTER TABLE mine_party_appt
ADD
    COLUMN IF NOT EXISTS mine_party_acknowledgement_status mine_party_acknowledgement_status;

UPDATE mine_party_appt
SET
    mine_party_acknowledgement_status = 'acknowledged'
WHERE
    mine_party_appt_type_code = 'EOR';
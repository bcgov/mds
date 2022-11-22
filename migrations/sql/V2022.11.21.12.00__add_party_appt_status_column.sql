CREATE TYPE mine_party_appt_status AS ENUM (
    'pending',
    'active',
    'inactive'
);

ALTER TABLE mine_party_appt
ADD
    COLUMN IF NOT EXISTS status mine_party_appt_status;
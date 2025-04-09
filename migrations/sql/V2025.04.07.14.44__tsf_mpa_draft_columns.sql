ALTER TABLE mine_tailings_storage_facility
    ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT true;
ALTER TABLE mine_tailings_storage_facility_version
    ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT true;

UPDATE mine_tailings_storage_facility SET is_draft = false;
UPDATE mine_tailings_storage_facility_version SET is_draft = false;

ALTER TABLE mine_party_appt
    ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false;

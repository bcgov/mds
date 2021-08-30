ALTER TABLE party
ADD COLUMN IF NOT EXISTS merged_party_guid uuid,
DROP CONSTRAINT IF EXISTS party_merged_party_guid_fkey,
ADD CONSTRAINT party_merged_party_guid_fkey FOREIGN KEY (merged_party_guid) REFERENCES party (party_guid);

ALTER TABLE mine_party_appt
ADD COLUMN IF NOT EXISTS merged_from_party_guid uuid,
DROP CONSTRAINT IF EXISTS mine_party_appt_merged_from_party_guid_fkey,
ADD CONSTRAINT mine_party_appt_merged_from_party_guid_fkey FOREIGN KEY (merged_from_party_guid) REFERENCES party (party_guid);

ALTER TABLE now_party_appointment
ADD COLUMN IF NOT EXISTS merged_from_party_guid uuid,
DROP CONSTRAINT IF EXISTS now_party_appointment_merged_from_party_guid_fkey,
ADD CONSTRAINT now_party_appointment_merged_from_party_guid_fkey FOREIGN KEY (merged_from_party_guid) REFERENCES party (party_guid);

ALTER TABLE party_business_role_appt
ADD COLUMN IF NOT EXISTS merged_from_party_guid uuid,
DROP CONSTRAINT IF EXISTS party_business_role_appt_merged_from_party_guid_fkey,
ADD CONSTRAINT party_business_role_appt_merged_from_party_guid_fkey FOREIGN KEY (merged_from_party_guid) REFERENCES party (party_guid);

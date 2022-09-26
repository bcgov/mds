ALTER TABLE party
ADD COLUMN IF NOT EXISTS organization_guid uuid,
DROP CONSTRAINT IF EXISTS party_organization_guid_fkey,
ADD CONSTRAINT party_organization_guid_fkey FOREIGN KEY (organization_guid) REFERENCES party (party_guid);

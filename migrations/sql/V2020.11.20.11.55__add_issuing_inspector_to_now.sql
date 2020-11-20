ALTER TABLE now_application
ADD COLUMN issuing_inspector_party_guid uuid;

ALTER TABLE now_application
ADD CONSTRAINT now_application_party_issuing_inspector_fkey
FOREIGN KEY (issuing_inspector_party_guid) REFERENCES party(party_guid) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE permit_amendment 
RENAME lead_inspector_title TO issuing_inspector_title;

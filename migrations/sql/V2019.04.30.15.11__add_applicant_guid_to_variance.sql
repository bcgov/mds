ALTER TABLE variance
ADD COLUMN applicant_guid uuid;

COMMENT ON COLUMN variance.applicant_guid IS 'GUID of the party on behalf of which the application was made.';

ALTER TABLE variance
ADD CONSTRAINT variance_application_guid_party_guid_fkey
    FOREIGN KEY (applicant_guid)
    REFERENCES party(party_guid)
    DEFERRABLE INITIALLY DEFERRED;

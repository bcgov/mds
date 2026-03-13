INSERT INTO party_business_role_code (party_business_role_code, description, active_ind, create_user, update_user)
    VALUES ('CNA', 'Consultation Advisor', true, 'system-mds', 'system-mds');

ALTER TABLE now_application
    ADD COLUMN consultation_advisor_party_guid UUID;

ALTER TABLE now_application
    ADD CONSTRAINT now_application_consultation_advisor_fkey
    FOREIGN KEY (consultation_advisor_party_guid) REFERENCES party(party_guid) ON UPDATE CASCADE ON DELETE SET NULL;
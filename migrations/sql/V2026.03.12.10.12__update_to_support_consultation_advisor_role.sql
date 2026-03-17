INSERT INTO party_business_role_code (
    party_business_role_code, description, active_ind, create_user, update_user
)
SELECT 'CNA', 'Consultation Advisor', true, 'system-mds', 'system-mds'
WHERE NOT EXISTS (
    SELECT 1
    FROM party_business_role_code
    WHERE party_business_role_code = 'CNA'
);

ALTER TABLE now_application
    ADD COLUMN IF NOT EXISTS consultation_advisor_party_guid UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'now_application_consultation_advisor_fkey'
    ) THEN
        ALTER TABLE now_application
        ADD CONSTRAINT now_application_consultation_advisor_fkey
        FOREIGN KEY (consultation_advisor_party_guid)
        REFERENCES party(party_guid)
        ON UPDATE CASCADE
        ON DELETE SET NULL;
    END IF;
END $$;
ALTER TABLE address
	ALTER COLUMN party_guid DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS project_contact_guid uuid,
    ADD CONSTRAINT project_contact_guid_fkey
        FOREIGN KEY (project_contact_guid) REFERENCES project_contact(project_contact_guid),
    ADD CONSTRAINT check_contact_guids check (
        (party_guid is not null and project_contact_guid is null) or (party_guid is null and project_contact_guid is not null)
    );

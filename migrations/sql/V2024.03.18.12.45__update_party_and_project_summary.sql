ALTER TABLE
  project_summary
ADD
  COLUMN IF NOT EXISTS company_alias VARCHAR(200) NULL,
ADD
  COLUMN IF NOT EXISTS incorporation_number VARCHAR(50) NULL,
ADD
  COLUMN IF NOT EXISTS is_legal_address_same_as_mailing_address BOOLEAN NULL,
ADD
  COLUMN IF NOT EXISTS is_billing_address_same_as_mailing_address BOOLEAN NULL,
ADD
  COLUMN IF NOT EXISTS is_billing_address_same_as_legal_address BOOLEAN NULL,
ADD
  COLUMN IF NOT EXISTS applicant_mailing_party_guid UUID NULL,
ADD
  COLUMN IF NOT EXISTS applicant_legal_party_guid UUID NULL,
ADD
  COLUMN IF NOT EXISTS applicant_billing_party_guid UUID NULL,
ADD
  CONSTRAINT applicant_mailing_guid_party_guid_fkey FOREIGN KEY (applicant_mailing_party_guid) REFERENCES party(party_guid),
ADD
  CONSTRAINT applicant_legal_guid_party_guid_fkey FOREIGN KEY (applicant_legal_party_guid) REFERENCES party(party_guid),
ADD
  CONSTRAINT applicant_billing_guid_party_guid_fkey FOREIGN KEY (applicant_billing_party_guid) REFERENCES party(party_guid);

INSERT INTO
  mine_party_appt_type_code (
    mine_party_appt_type_code,
    description,
    display_order,
    create_user,
    update_user,
    person,
    organization,
    grouping_level
  )
VALUES
  (
    'APP',
    'Applicant',
    290,
    'system-mds',
    'system-mds',
    'true',
    'false',
    1
  );

ALTER TABLE
  party
ADD
  COLUMN IF NOT EXISTS middle_name VARCHAR(100) NULL;
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
  COLUMN IF NOT EXISTS applicant_billing_party_guid UUID NULL;

ALTER TABLE
  party
ADD
  COLUMN IF NOT EXISTS middle_name VARCHAR(100) NULL;
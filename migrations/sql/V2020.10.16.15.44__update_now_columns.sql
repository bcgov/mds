ALTER TABLE now_application DROP COLUMN is_applicant_individual_or_company;
ALTER TABLE now_application ADD COLUMN IF NOT EXISTS is_applicant_individual_or_company varchar;
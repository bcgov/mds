ALTER TABLE party
ADD COLUMN IF NOT EXISTS job_title_code varchar(3),
DROP CONSTRAINT IF EXISTS party_job_title_code_fkey,
ADD CONSTRAINT party_job_title_code_fkey FOREIGN KEY (job_title_code) REFERENCES mine_party_appt_type_code (mine_party_appt_type_code);

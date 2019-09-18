ALTER TABLE now_submissions.application ALTER COLUMN originating_system drop default; 
ALTER TABLE now_submissions.application ALTER COLUMN originating_system drop not NULL;
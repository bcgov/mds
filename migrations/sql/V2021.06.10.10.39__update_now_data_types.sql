alter TABLE now_submissions.application alter column sandgrvqrymaxunreclaimed type numeric;
ALTER TABLE now_submissions.application ALTER COLUMN originalstartdate TYPE DATE using originalstartdate::DATE;
alter table now_application ALTER COLUMN original_start_date TYPE DATE using original_start_date::DATE;



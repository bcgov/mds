-- Drop amendment columns
alter table permit drop column IF EXISTS received_date;
alter table permit drop column IF EXISTS issue_date;
alter table permit drop column IF EXISTS authorization_end_date;

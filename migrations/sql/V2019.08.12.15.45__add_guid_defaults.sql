ALTER TABLE public.mine_report
ALTER COLUMN mine_report_guid SET DEFAULT gen_random_uuid();

ALTER TABLE public.mine_report_submission
ALTER COLUMN mine_report_submission_guid SET DEFAULT gen_random_uuid();

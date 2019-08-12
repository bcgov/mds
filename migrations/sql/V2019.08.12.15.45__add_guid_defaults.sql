ALTER TABLE public.mine_report
ALTER COLUMN mine_report_guid SET DEFAULT gen_random_uuid();

ALTER TABLE now_submissions.application
ADD COLUMN IF NOT EXISTS maxannualcubicmeters   numeric,
ADD COLUMN IF NOT EXISTS proposedstartmonth     varchar(100),
ADD COLUMN IF NOT EXISTS proposedstartday       varchar(100),
ADD COLUMN IF NOT EXISTS proposedendmonth       varchar(100),
ADD COLUMN IF NOT EXISTS proposedendday         varchar(100),
ADD COLUMN IF NOT EXISTS minepurpose            varchar(100);


ALTER TABLE now_submissions.exp_access_activity
ADD COLUMN IF NOT EXISTS lengthinmeters numeric,
ADD COLUMN IF NOT EXISTS width          numeric;

ALTER TABLE now_submissions.camps
ADD COLUMN IF NOT EXISTS length numeric,
ADD COLUMN IF NOT EXISTS width  numeric;


ALTER TABLE now_submissions.buildings
ADD COLUMN IF NOT EXISTS length numeric,
ADD COLUMN IF NOT EXISTS width  numeric;

ALTER TABLE now_submissions.stagingareas
ADD COLUMN IF NOT EXISTS length numeric,
ADD COLUMN IF NOT EXISTS width  numeric;

ALTER TABLE now_submissions.exp_surface_drill_activity
ADD COLUMN IF NOT EXISTS length numeric,
ADD COLUMN IF NOT EXISTS width  numeric;

ALTER TABLE now_submissions.surface_bulk_sample_activity
ADD COLUMN IF NOT EXISTS length numeric,
ADD COLUMN IF NOT EXISTS width  numeric;

ALTER TABLE now_submissions.under_exp_surface_activity
ADD COLUMN IF NOT EXISTS length numeric,
ADD COLUMN IF NOT EXISTS width  numeric;


ALTER TABLE now_submissions.sand_grv_qry_activity
ADD COLUMN IF NOT EXISTS length numeric,
ADD COLUMN IF NOT EXISTS width  numeric;
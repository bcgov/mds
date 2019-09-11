ALTER TABLE now_submissions.application ALTER COLUMN fuellubstored TYPE bigint;
ALTER TABLE now_submissions.application ALTER COLUMN underexptotalore TYPE bigint;
ALTER TABLE now_submissions.application ALTER COLUMN underexptotalwaste TYPE bigint;
ALTER TABLE now_submissions.application ALTER COLUMN sandgrvqrytotalmineres TYPE bigint;
ALTER TABLE now_submissions.application ALTER COLUMN sandgrvqryannualextrest TYPE bigint;
ALTER TABLE now_submissions.application ALTER COLUMN sandgrvqryimpactdistres TYPE bigint;
ALTER TABLE now_submissions.application ALTER COLUMN sandgrvqryimpactdistwater TYPE bigint;
ALTER TABLE now_submissions.application ALTER COLUMN cutlinesexplgridtotallinekms TYPE bigint;

ALTER TABLE now_submissions.equipment ALTER COLUMN quantity TYPE bigint;

ALTER TABLE now_submissions.mech_trenching_activity ALTER COLUMN numberofsites TYPE bigint;

ALTER TABLE now_submissions.placer_activity ALTER COLUMN depth TYPE bigint;

ALTER TABLE now_submissions.settling_pond ALTER COLUMN depth TYPE bigint;

ALTER TABLE now_submissions.under_exp_new_activity ALTER COLUMN quantity TYPE bigint;

ALTER TABLE now_submissions.under_exp_rehab_activity ALTER COLUMN quantity TYPE bigint;

ALTER TABLE now_submissions.under_exp_surface_activity ALTER COLUMN quantity TYPE bigint;
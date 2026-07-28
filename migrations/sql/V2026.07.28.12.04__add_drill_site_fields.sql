ALTER TABLE now_submissions.application ADD COLUMN IF NOT EXISTS
    nowmorethan25drillsites varchar;

ALTER TABLE now_submissions.application ADD COLUMN IF NOT EXISTS
    nowexplnumprpsdunrecldrillsite integer;

ALTER TABLE exploration_surface_drilling ADD COLUMN IF NOT EXISTS
    has_more_than_25_unreclaimed_drill_sites boolean;

ALTER TABLE exploration_surface_drilling ADD COLUMN IF NOT EXISTS
    num_unreclaimed_drill_sites integer;

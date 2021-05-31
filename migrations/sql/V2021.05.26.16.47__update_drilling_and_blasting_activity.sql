ALTER TABLE exploration_surface_drilling ADD COLUMN IF NOT EXISTS drill_program varchar;

ALTER TABLE now_submissions.application ADD COLUMN IF NOT EXISTS expsurfacedrillprogam varchar;

ALTER TABLE now_submissions.application ADD COLUMN IF NOT EXISTS describeexplosivetosite varchar;
ALTER TABLE blasting_operation ADD COLUMN IF NOT EXISTS describe_explosives_to_site varchar;
ALTER TABLE exploration_surface_drilling ADD COLUMN drill_program varchar;

ALTER TABLE now_submissions.application ADD COLUMN expsurfacedrillprogam varchar;

ALTER TABLE now_submissions.application ADD COLUMN describeexplosivetosite varchar;
ALTER TABLE blasting_operation ADD COLUMN describe_explosives_to_site varchar;
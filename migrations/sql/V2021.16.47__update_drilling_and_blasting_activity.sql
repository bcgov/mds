ALTER TABLE exploration_surface_drilling ADD COLUMN drill_program character varying(100);

ALTER TABLE now_submissions.application ADD COLUMN expsurfacedrillprogam character varying(100);

ALTER TABLE now_submissions.application ADD COLUMN describeexplosivetosite character varying(4000);
ALTER TABLE blasting_operation ADD COLUMN describe_explosives_to_site character varying(4000);
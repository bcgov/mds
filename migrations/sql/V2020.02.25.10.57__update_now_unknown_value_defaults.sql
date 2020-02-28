ALTER TABLE exploration_access ALTER COLUMN has_proposed_bridges_or_culverts DROP DEFAULT;

ALTER TABLE now_application ALTER COLUMN has_surface_disturbance_outside_tenure DROP DEFAULT;
ALTER TABLE now_application ALTER COLUMN is_access_gated DROP DEFAULT;
ALTER TABLE now_application ALTER COLUMN has_key_for_inspector DROP DEFAULT;
ALTER TABLE now_application ALTER COLUMN has_req_access_authorizations DROP DEFAULT;

ALTER TABLE state_of_land ALTER COLUMN has_shared_info_with_fn DROP DEFAULT;
ALTER TABLE state_of_land ALTER COLUMN has_fn_cultural_heritage_sites_in_area DROP DEFAULT;
ALTER TABLE state_of_land ALTER COLUMN has_activity_in_park DROP DEFAULT;
ALTER TABLE state_of_land ALTER COLUMN is_on_private_land DROP DEFAULT;
ALTER TABLE state_of_land ALTER COLUMN has_auth_lieutenant_gov_council DROP DEFAULT;

ALTER TABLE surface_bulk_sample ALTER COLUMN has_bedrock_expansion DROP DEFAULT;

ALTER TABLE exploration_access ALTER COLUMN has_proposed_bridges_or_culverts DROP NOT NULL;

ALTER TABLE now_application ALTER COLUMN has_surface_disturbance_outside_tenure DROP NOT NULL;
ALTER TABLE now_application ALTER COLUMN is_access_gated DROP NOT NULL;
ALTER TABLE now_application ALTER COLUMN has_key_for_inspector DROP NOT NULL;
ALTER TABLE now_application ALTER COLUMN has_req_access_authorizations DROP NOT NULL;

ALTER TABLE state_of_land ALTER COLUMN has_shared_info_with_fn DROP NOT NULL;
ALTER TABLE state_of_land ALTER COLUMN has_fn_cultural_heritage_sites_in_area DROP NOT NULL;
ALTER TABLE state_of_land ALTER COLUMN has_activity_in_park DROP NOT NULL;
ALTER TABLE state_of_land ALTER COLUMN is_on_private_land DROP NOT NULL;
ALTER TABLE state_of_land ALTER COLUMN has_auth_lieutenant_gov_council DROP NOT NULL;

ALTER TABLE surface_bulk_sample ALTER COLUMN has_bedrock_expansion DROP NOT NULL;
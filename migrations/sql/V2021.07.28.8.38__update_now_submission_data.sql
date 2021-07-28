ALTER TABLE now_application 
ADD COLUMN IF NOT EXISTS proponent_submitted_permit_number varchar,
ADD COLUMN IF NOT EXISTS ats_authorization_number numeric,
ADD COLUMN IF NOT EXISTS annual_summary_submitted boolean,
ADD COLUMN IF NOT EXISTS ats_project_number numeric,
ADD COLUMN IF NOT EXISTS file_number_of_app varchar,
ADD COLUMN IF NOT EXISTS is_first_year_of_multi boolean,
ADD COLUMN IF NOT EXISTS unreclaimed_disturbance_previous_year numeric,
ADD COLUMN IF NOT EXISTS disturbance_planned_reclamation numeric,
ADD COLUMN IF NOT EXISTS original_start_date varchar;


ALTER TABLE state_of_land ADD COLUMN legal_description_land varchar;
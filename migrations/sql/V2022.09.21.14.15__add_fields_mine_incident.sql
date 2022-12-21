ALTER TABLE IF EXISTS mine_incident
	ADD COLUMN IF NOT EXISTS immediate_measures_taken 				TEXT,
	ADD COLUMN IF NOT EXISTS injuries_description 						TEXT,
	ADD COLUMN IF NOT EXISTS johsc_worker_rep_name 						VARCHAR(255),
	ADD COLUMN IF NOT EXISTS johsc_worker_rep_contacted 			BOOLEAN,
	ADD COLUMN IF NOT EXISTS johsc_management_rep_name 			  VARCHAR(255),
	ADD COLUMN IF NOT EXISTS johsc_management_rep_contacted 	BOOLEAN;

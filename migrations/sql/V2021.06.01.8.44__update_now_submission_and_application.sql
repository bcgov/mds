ALTER TABLE now_submissions.application
ADD COLUMN IF NOT EXISTS permitnumber varchar,
ADD COLUMN IF NOT EXISTS atsauthorizationnumber numeric,
ADD COLUMN IF NOT EXISTS atsprojectnumber numeric,
ADD COLUMN IF NOT EXISTS filenumberofappl varchar,
ADD COLUMN IF NOT EXISTS originalstartdate varchar,
ADD COLUMN IF NOT EXISTS annualsummarysubmitted varchar,
ADD COLUMN IF NOT EXISTS firstyearofmulti varchar,
ADD COLUMN IF NOT EXISTS authorizationdetail varchar,
ADD COLUMN IF NOT EXISTS oncrownland varchar, 
ADD COLUMN IF NOT EXISTS havelicenceofoccupation varchar, 
ADD COLUMN IF NOT EXISTS appliedforlicenceofoccupation varchar,
ADD COLUMN IF NOT EXISTS licenceofoccupation varchar,
ADD COLUMN IF NOT EXISTS noticeservedtoprivate varchar,
ADD COLUMN IF NOT EXISTS sandgrvqryprogressivereclam varchar,
ADD COLUMN IF NOT EXISTS sandgrvqrymaxunreclaimed varchar, 
ADD COLUMN IF NOT EXISTS pondtypeofsediment varchar,
ADD COLUMN IF NOT EXISTS pondtypeconstruction varchar,
ADD COLUMN IF NOT EXISTS pondarea varchar,
ADD COLUMN IF NOT EXISTS pondspillwaydesign varchar,
ADD COLUMN IF NOT EXISTS camphealthauthority varchar,
ADD COLUMN IF NOT EXISTS camphealthconsent varchar,
ADD COLUMN IF NOT EXISTS proposedproductionunit varchar,
ADD COLUMN IF NOT EXISTS placerstreamdiversion varchar,
ADD COLUMN IF NOT EXISTS sandgrvqrydescription varchar;



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


ALTER TABLE state_of_land ADD COLUMN is_on_crown_land boolean;
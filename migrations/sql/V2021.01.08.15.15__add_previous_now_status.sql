Alter table now_application add column previous_application_status_code character varying(3);

UPDATE now_application_status SET active_ind = false WHERE now_application_status_code = 'REI';
UPDATE now_application_status SET active_ind = false WHERE now_application_status_code = 'PCO';
UPDATE now_application_status SET active_ind = false WHERE now_application_status_code = 'PAP';

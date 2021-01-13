Alter table now_application add column previous_application_status_code character varying(3);
ALTER TABLE ONLY now_application ADD CONSTRAINT previous_application_status_code_fkey FOREIGN KEY (previous_application_status_code) REFERENCES now_application_status(now_application_status_code);

UPDATE now_application_status SET active_ind = false WHERE now_application_status_code = 'REI';
UPDATE now_application_status SET active_ind = false WHERE now_application_status_code = 'PCO';
UPDATE now_application_status SET active_ind = false WHERE now_application_status_code = 'PAP';


INSERT INTO now_application_status
(now_application_status_code, description, display_order, active_ind, create_user, update_user)
VALUES
  ('PEV', 'Pending Verificaton', 130, true, 'system-mds', 'system-mds')
on conflict do nothing;

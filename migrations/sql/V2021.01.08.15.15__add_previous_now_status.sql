Alter table now_application add column previous_application_status_code character varying(3);


INSERT INTO now_application_status
(now_application_status_code, description, display_order, active_ind, create_user, update_user)
VALUES
	('REF', 'Referred', 70, true, 'system-mds', 'system-mds'),
	('CDI', 'Client Delay', 30, true, 'system-mds', 'system-mds'),
  ('GVD', 'Govt. Action Required', 60, true, 'system-mds', 'system-mds'),
  ('AIA', 'Approved', 10, true, 'system-mds', 'system-mds'),
	('REJ', 'Rejected', 80, true, 'system-mds', 'system-mds'),
  ('REC', 'Received', 90, true, 'system-mds', 'system-mds'),
  ('PAP', 'Pending Approval', 50, true, 'system-mds', 'system-mds'),
	('REI', 'Rejected-Initial', 100, true, 'system-mds', 'system-mds'),
	('PCO', 'Permit Closed', 40, true, 'system-mds', 'system-mds'),
	('NPR', 'No Permit Required', 110, true, 'system-mds', 'system-mds'),
	('RCO', 'Referral Complete', 120, true, 'system-mds', 'system-mds')
on conflict do nothing;

UPDATE now_application_status SET active_ind = false WHERE now_application_status_code = 'REI';
UPDATE now_application_status SET active_ind = false WHERE now_application_status_code = 'PCO';
UPDATE now_application_status SET active_ind = false WHERE now_application_status_code = 'PAP';

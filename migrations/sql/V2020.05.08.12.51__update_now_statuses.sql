INSERT INTO now_application_status
(now_application_status_code, description, display_order, active_ind, create_user, update_user)
VALUES
	('REC', 'Received', 90, true, 'system-mds', 'system-mds'),
    ('PAP', 'Pending Approval', 50, true, 'system-mds', 'system-mds'),
	('REI', 'Rejected-Initial', 100, true, 'system-mds', 'system-mds'),
	('PCO', 'Permit Closed', 40, true, 'system-mds', 'system-mds'),
	('NPR', 'No Permit Required', 110, true, 'system-mds', 'system-mds'),
	('RCO', 'Referral Complete', 120, true, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

UPDATE now_application_status SET description = 'Client delayed' where now_application_status_code = 'CDI';
UPDATE now_application_status SET description = 'Govt. Action Required' where now_application_status_code = 'GVD';
UPDATE now_application_status SET description = 'Approved' where now_application_status_code = 'AIA';

update now_application set now_application_status_code = 'REC' where now_application_status_code = 'SUB';
update now_application set now_application_status_code = 'CDI' where now_application_status_code = 'CDB';
update now_application set now_application_status_code = 'PAP' where now_application_status_code = 'CON';
update now_application set now_application_status_code = 'REI' where now_application_status_code = 'WDN';
update now_application set now_application_status_code = 'PCO' where now_application_status_code = 'CLO';

DELETE FROM now_application_status WHERE now_application_status_code = 'SUB';
DELETE FROM now_application_status WHERE now_application_status_code = 'CDB';
DELETE FROM now_application_status WHERE now_application_status_code = 'CON';
DELETE FROM now_application_status WHERE now_application_status_code = 'WDN';
DELETE FROM now_application_status WHERE now_application_status_code = 'CLO';

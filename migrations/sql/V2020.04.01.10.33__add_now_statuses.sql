-- Create a new column for defining the desired display order of the statuses
ALTER TABLE now_application_status ADD COLUMN display_order integer;

-- Inactivate all of the existing Core statuses and set their display order
UPDATE now_application_status SET active_ind = false, display_order = 5 WHERE now_application_status_code = 'ACC';
UPDATE now_application_status SET active_ind = false, display_order = 95 WHERE now_application_status_code = 'UNR';
UPDATE now_application_status SET active_ind = false, display_order = 100 WHERE now_application_status_code = 'WDN';

-- Create new statuses (from MMS)
INSERT INTO now_application_status
(now_application_status_code, description, display_order, active_ind, create_user, update_user)
VALUES
	('SUB', 'Submitted', 90, true, 'system-mds', 'system-mds'),
	('REF', 'Referred', 70, true, 'system-mds', 'system-mds'),
	('CDI', 'Client Delay Info', 30, true, 'system-mds', 'system-mds'),
	('CDB', 'Client Delay Bond', 20, true, 'system-mds', 'system-mds'),
    ('GVD', 'Govt Delay', 60, true, 'system-mds', 'system-mds'),
    ('CON', 'Consultation', 50, true, 'system-mds', 'system-mds'),
    ('AIA', 'Active/Issued/Approved', 10, true, 'system-mds', 'system-mds'),
	('WTN', 'Withdrawn', 100, true, 'system-mds', 'system-mds'),
	('REJ', 'Rejected', 80, true, 'system-mds', 'system-mds'),
	('CLO', 'Closed', 40, true, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;
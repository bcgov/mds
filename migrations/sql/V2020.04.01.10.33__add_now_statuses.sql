-- Create a new column for defining the desired display order of the statuses
ALTER TABLE now_application_status ADD COLUMN display_order integer;

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
	('WDN', 'Withdrawn', 100, true, 'system-mds', 'system-mds'),
	('REJ', 'Rejected', 80, true, 'system-mds', 'system-mds'),
	('CLO', 'Closed', 40, true, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

-- Set all of the current NoW statuses to the new default status (Submitted)
UPDATE now_application SET now_application_status_code = 'SUB';

-- Delete all of the old Core statuses (Accepted, Under Review, and Withdrawn)
DELETE FROM now_application_status WHERE now_application_status_code = 'ACC';
DELETE FROM now_application_status WHERE now_application_status_code = 'UNR';
DELETE FROM now_application_status WHERE now_application_status_code = 'WDN';

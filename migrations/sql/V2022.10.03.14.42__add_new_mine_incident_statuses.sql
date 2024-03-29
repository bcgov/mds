INSERT INTO mine_incident_status_code
	(mine_incident_status_code, description, display_order, create_user, update_user)
VALUES
	('IRS', 'Initial Report Submitted', 10, 'system-mds', 'system-mds'),
    ('AFR', 'Awaiting Final Report', 20, 'system-mds', 'system-mds'),
    ('FRS', 'Final Report Submitted', 30, 'system-mds', 'system-mds'),
    ('UNR', 'Under Review', 40, 'system-mds', 'system-mds'),
	('INV', 'Investigating', 50, 'system-mds', 'system-mds'), 
    ('MIU', 'MIU', 60, 'system-mds', 'system-mds'),
    ('CLD', 'Closed', 70, 'system-mds', 'system-mds'),
    ('DFT', 'Draft', 80, 'system-mds', 'system-mds');

INSERT INTO now_application_document_type
(now_application_document_type_code, description, active_ind, create_user, update_user)
VALUES
	('CAL', 'Client Acknowledgement Letter', true, 'system-mds', 'system-mds'),
	('WDL', 'Withdrawl Letter', true, 'system-mds', 'system-mds'),
	('RJL', 'Rejection Letter', true, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;
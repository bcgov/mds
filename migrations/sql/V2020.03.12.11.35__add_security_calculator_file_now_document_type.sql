INSERT INTO now_application_document_type
(now_application_document_type_code, description, active_ind, create_user, update_user)
VALUES
	('SBC', 'Security Calculation', true, 'system-mds', 'system-mds')
on conflict do nothing;
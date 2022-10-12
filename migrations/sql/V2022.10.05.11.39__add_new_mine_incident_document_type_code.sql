INSERT INTO mine_incident_document_type_code(mine_incident_document_type_code, description, active_ind, create_user, update_user)
VALUES('INM', 'Internal Ministry Document', true, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

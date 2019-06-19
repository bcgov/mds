ALTER TABLE mine_incident_followup_investigation_type ADD COLUMN active_ind boolean default 'T'; 

INSERT INTO mine_incident_followup_investigation_type
	(
	mine_incident_followup_investigation_type_code,
	description,
	display_order,
    active_ind,
	create_user,
	update_user
	)
VALUES
('HUK', 'Historical - Unknown', 40, 'F', 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;
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

ALTER TABLE mine_incident ADD COLUMN mine_incident_no character varying(10); 
ALTER TABLE mine_incident ADD COLUMN mms_insp_cd character varying(3);
ALTER TABLE mine_incident ADD COLUMN proponent_incident_no character varying(20);

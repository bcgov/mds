ALTER TABLE now_application_document_xref ADD COLUMN description CHARACTER VARYING;
ALTER TABLE now_application_document_xref ADD COLUMN is_final_package BOOLEAN;
ALTER TABLE now_application_document_type ALTER COLUMN description TYPE CHARACTER VARYING(255);
ALTER TABLE now_application_document_xref ADD COLUMN create_user character varying NOT NULL;
ALTER TABLE now_application_document_xref ADD COLUMN create_timestamp timestamp with time zone DEFAULT now() NOT NULL;
ALTER TABLE now_application_document_xref ADD COLUMN update_user character varying NOT NULL;
ALTER TABLE now_application_document_xref ADD COLUMN update_timestamp timestamp with time zone DEFAULT now() NOT NULL;

INSERT INTO now_application_document_type
(now_application_document_type_code, description, active_ind, create_user, update_user)
VALUES
	('ANS', 'Annual Summary', true, 'system-mds', 'system-mds'),
	('ACP', 'Archaeological Chance Find Procedure', true, 'system-mds', 'system-mds'),
	('BLP', 'Blasting Procedure', true, 'system-mds', 'system-mds'),
	('EMS', 'Explosives Magazine Storage and Use Permit Application', true, 'system-mds', 'system-mds'),
	('LAL', 'Landowner Authorization Letter', true, 'system-mds', 'system-mds'),
	('MRP', 'Mine Emergency Response Plan', true, 'system-mds', 'system-mds'),
	('OTH', 'Other', true, 'system-mds', 'system-mds'),
	('RFE', 'Record of First Nations Engagement', true, 'system-mds', 'system-mds'),
	('TAL', 'Tenure Authorization Letter', true, 'system-mds', 'system-mds'),
	('TMP', 'Tenure Map / Property Map', true, 'system-mds', 'system-mds'),
	('MPW', 'Map of Proposed Work', true, 'system-mds', 'system-mds')
on conflict do nothing;
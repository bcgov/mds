ALTER TABLE mine_incident 
DROP COLUMN closing_report_summary,
DROP COLUMN followup_inspection_no,
DROP COLUMN reported_by_role,
DROP COLUMN followup_type_code,
DROP COLUMN reported_by;

CREATE TABLE mine_incident_status_code (
    mine_incident_status_code 		 character varying(3)                   NOT NULL PRIMARY KEY,
    description                      character varying(100)                 NOT NULL            ,
    display_order					 int2									NOT NULL			,
    active_ind                       boolean                  DEFAULT true  NOT NULL            ,
    create_user                      character varying(60)                  NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL            ,
    update_user                      character varying(60)                  NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE mine_incident_status_code OWNER TO mds;

COMMENT ON TABLE mine_incident_status_code IS 'The status of a reported mine incident.';

CREATE TABLE mine_incident_recommendation (
    mine_incident_recommendation_id 	SERIAL		PRIMARY KEY NOT NULL,
    mine_incident_id					INT4		REFERENCES mine_incident(mine_incident_id) NOT NULL,
    recommendation                      CHARACTER 	VARYING NOT NULL,
    create_user                      	character 	VARYING(60) NOT NULL,
    create_timestamp                 	timestamp 	WITH TIME ZONE DEFAULT now() NOT NULL,
    update_user                      	character 	VARYING(60) NOT NULL,
    update_timestamp                 	timestamp 	WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE mine_incident_recommendation OWNER TO mds;

COMMENT ON TABLE mine_incident_recommendation IS 'A recommendation made as the result of an incident at a mine.';

ALTER TABLE IF EXISTS mine_incident_followup_type
RENAME TO mine_incident_followup_investigation_type;

TRUNCATE TABLE mine_incident_followup_investigation_type;

ALTER TABLE mine_incident_followup_investigation_type RENAME COLUMN mine_incident_followup_type_code TO mine_incident_followup_investigation_type_code;

ALTER TABLE mine_incident 
ADD COLUMN status_code CHARACTER VARYING(3) REFERENCES mine_incident_status_code(mine_incident_status_code),
ADD COLUMN reported_by_name CHARACTER VARYING(255),
ADD COLUMN reported_by_phone_no CHARACTER VARYING(12),
ADD COLUMN reported_by_phone_ext CHARACTER VARYING(4),
ADD COLUMN reported_by_email CHARACTER VARYING(254),
ADD COLUMN reported_to_inspector_party_guid UUID REFERENCES party(party_guid),
ADD COLUMN responsible_inspector_party_guid UUID REFERENCES party(party_guid),
ADD COLUMN determination_inspector_party_guid UUID REFERENCES party(party_guid),
ADD COLUMN number_of_fatalities INT4,
ADD COLUMN number_of_injuries INT4,
ADD COLUMN emergency_services_called BOOLEAN,
ADD COLUMN followup_inspection BOOLEAN,
ADD COLUMN followup_investigation_type_code CHARACTER VARYING(3) REFERENCES mine_incident_followup_investigation_type(mine_incident_followup_investigation_type_code),
ADD COLUMN followup_inspection_date TIMESTAMPTZ;

INSERT INTO mine_incident_followup_investigation_type
	(
	mine_incident_followup_investigation_type_code,
	description,
	display_order,
	create_user,
	update_user
	)
VALUES
	('MIU', 'Yes - MIU Investigation', 10, 'system-mds', 'system-mds'),
	('INS', 'Yes - Inspector Investigation', 20, 'system-mds', 'system-mds'),
	('NO', 'No', 30, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

INSERT INTO mine_incident_status_code
	(
	mine_incident_status_code,
	description,
	display_order,
	create_user,
	update_user
	)
VALUES
	('PRE', 'Preliminary', 10, 'system-mds', 'system-mds'),
	('FIN', 'Final', 20, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;
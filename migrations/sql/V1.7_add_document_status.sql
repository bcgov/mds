CREATE TABLE mine_expected_document_status (
	exp_document_status_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    description character varying(100) NOT NULL,
    display_order smallint NOT NULL,
	
	create_user      character varying(60) NOT NULL,
	create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
	update_user      character varying(60) NOT NULL,
	update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
	
);

COMMENT ON TABLE mine_expected_document IS 'Values for expected document statuses.';

INSERT INTO mine_expected_document_status (
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('Not Recieved', 10, 'system-mds', 'system-mds'),
    ('Recieved / Pending Review', 20, 'system-mds', 'system-mds'),
    ('Review In Progress', 30, 'system-mds', 'system-mds'),
    ('Accepted', 40, 'system-mds', 'system-mds'),
    ('Rejected / Waiting On Update', 50, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

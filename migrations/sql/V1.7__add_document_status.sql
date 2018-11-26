CREATE TABLE mine_expected_document_status
(
    exp_document_status_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    description character varying(100) NOT NULL,
    display_order smallint NOT NULL,
    active_ind boolean NOT NULL DEFAULT 'true',
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp
    with time zone NOT NULL DEFAULT current_timestamp,
	update_user      character varying
    (60) NOT NULL,
	update_timestamp timestamp
    with time zone NOT NULL DEFAULT current_timestamp	
);

COMMENT ON TABLE mine_expected_document IS 'Values for expected document statuses.';

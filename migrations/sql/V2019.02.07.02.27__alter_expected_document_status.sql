ALTER TABLE mine_expected_document DROP CONSTRAINT mine_expected_document_exp_document_status_guid_fkey;
ALTER TABLE mine_expected_document DROP COLUMN exp_document_status_guid;
ALTER TABLE mine_expected_document ADD COLUMN exp_document_status_code character varying(3) NOT NULL DEFAULT 'MIA';

DROP TABLE mine_expected_document_status;
CREATE TABLE mine_expected_document_status_code (
    exp_document_status_code character varying(3) PRIMARY KEY DEFAULT 'MIA',
    description character varying(100) NOT NULL,
    display_order smallint NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE mine_expected_document_status_code OWNER TO mds;

ALTER TABLE mine_expected_document
    ADD CONSTRAINT mine_expected_document_exp_document_status_code_fkey FOREIGN KEY (exp_document_status_code) REFERENCES mine_expected_document_status_code(exp_document_status_code) DEFERRABLE INITIALLY DEFERRED;

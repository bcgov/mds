CREATE TABLE required_document_due_date_type (
    req_document_due_date_type character varying(3) PRIMARY KEY NOT NULL,
    req_document_due_date_description character varying(60) NOT NULL,
    active_ind       boolean NOT NULL DEFAULT 'true',
    create_user      character varying(60) NOT NULL,
    create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
    update_user      character varying(60) NOT NULL,
    update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp
);

COMMENT ON TABLE required_document_due_date_type IS 'A required_document_due_date_type is fixed tag on an mds_required_document for to indicate the rules around when it is due';

ALTER TABLE mds_required_document
    ADD req_document_due_date_period_months integer NOT NULL,
    ADD req_document_due_date_type character varying(3) NOT NULL,
    ADD FOREIGN KEY (req_document_due_date_type) REFERENCES required_document_due_date_type(req_document_due_date_type) DEFERRABLE INITIALLY DEFERRED
;
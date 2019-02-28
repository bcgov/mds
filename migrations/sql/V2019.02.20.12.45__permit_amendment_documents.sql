CREATE TABLE permit_amendment_document (
    permit_amendment_document_guid uuid DEFAULT gen_random_uuid() NOT NULL,
    permit_amendment_id integer,
    mine_guid uuid NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    document_name character varying(255) NOT NULL,
    document_manager_guid uuid NOT NULL,

    FOREIGN KEY (permit_amendment_id) REFERENCES permit_amendment(permit_amendment_id) DEFERRABLE INITIALLY DEFERRED
);


ALTER TABLE permit_amendment_document OWNER TO mds;
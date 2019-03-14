CREATE TABLE application_status_code(
    application_status_code character varying(3) PRIMARY KEY,
    description character varying(100) NOT NULL,
    display_order smallint NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE application_status_code IS 'A list of stat and the mines they are associated with.';

CREATE TABLE application
(
    application_id serial PRIMARY KEY,
    application_guid uuid DEFAULT gen_random_uuid() NOT NULL,
    mine_guid uuid NOT NULL,
    application_no character varying(16) NOT NULL,
    description character varying(280),
    application_status_code character varying(3) NOT NULL,
    recieved_date date NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    
    FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid)
    DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (application_status_code) REFERENCES application_status_code(application_status_code)
    DEFERRABLE INITIALLY DEFERRED
);


COMMENT ON TABLE application IS 'A list of applications and the mines they are associated with.';
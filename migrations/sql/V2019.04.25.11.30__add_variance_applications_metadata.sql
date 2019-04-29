CREATE TABLE variance_application_status_code (
    variance_application_status_code character varying(3)                   NOT NULL PRIMARY KEY,
    description                      character varying(100)                 NOT NULL            ,
    active_ind                       boolean                  DEFAULT true  NOT NULL            ,
    create_user                      character varying(60)                  NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL            ,
    update_user                      character varying(60)                  NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE variance_application_status_code OWNER TO mds;

COMMENT ON TABLE variance_application_status_code IS 'The valid options for a variance / variance application.';

ALTER TABLE variance
ADD COLUMN variance_application_status_code character varying(3) DEFAULT 'REV' NOT NULL,
ADD COLUMN ohsc_ind                         boolean              DEFAULT FALSE NOT NULL,
ADD COLUMN union_ind                        boolean              DEFAULT FALSE NOT NULL,
ADD COLUMN inspector_id                     integer                                    ;

ALTER TABLE variance
ALTER COLUMN issue_date  DROP NOT NULL,
ALTER COLUMN expiry_date DROP NOT NULL;

ALTER TABLE variance
ALTER COLUMN issue_date    DROP DEFAULT,
ALTER COLUMN expiry_date   DROP DEFAULT,
ALTER COLUMN received_date DROP DEFAULT;

ALTER TABLE variance
ADD CONSTRAINT variance_status_variance_application_status_code_fkey
    FOREIGN KEY (variance_application_status_code)
    REFERENCES variance_application_status_code(variance_application_status_code)
    DEFERRABLE INITIALLY DEFERRED,
ADD CONSTRAINT variance_inspector_core_user_fkey
    FOREIGN KEY (inspector_id) REFERENCES core_user(core_user_id) DEFERRABLE INITIALLY DEFERRED;

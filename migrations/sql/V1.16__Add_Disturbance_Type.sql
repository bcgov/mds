CREATE TABLE mine_disturbance_code (
    mine_disturbance_code character varying(3) PRIMARY KEY NOT NULL,
    description           character varying(100) NOT NULL,
    active_ind            boolean NOT NULL DEFAULT TRUE,

    --Audit Columns
    create_user      character varying(60) NOT NULL,
    create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
    update_user      character varying(60) NOT NULL,
    update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp
);

COMMENT ON TABLE mine_disturbance_code IS 'The valid options for a mine disturbance type.';

CREATE TABLE mine_type_detail_xref (
    mine_type_detail_xref_guid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_disturbance_code      character varying(3) NOT NULL,
    mine_type_guid             uuid NOT NULL,

    -- Audit Columns
    create_user      character varying(60) NOT NULL,
    create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
    update_user      character varying(60) NOT NULL,
    update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,

    -- Foreign Key Definitions
    FOREIGN KEY (mine_disturbance_code) REFERENCES mine_disturbance_code(mine_disturbance_code) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (mine_type_guid) REFERENCES mine_type(mine_type_guid) DEFERRABLE INITIALLY DEFERRED,

    -- Constraints
    CONSTRAINT mine_type_guid_mine_disturbance_code_uniqeness UNIQUE (mine_type_guid, mine_disturbance_code)
);

COMMENT ON TABLE mine_type_detail_xref IS 'A lookup of all valid disturbance types.';

CREATE TABLE mine_commodity_code (
    mine_commodity_code   character varying(2) PRIMARY KEY NOT NULL,
    description           character varying(100) NOT NULL,
    active_ind            boolean NOT NULL DEFAULT TRUE,

    --Audit Columns
    create_user      character varying(60) NOT NULL,
    create_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp,
    update_user      character varying(60) NOT NULL,
    update_timestamp timestamp with time zone NOT NULL DEFAULT current_timestamp
);

COMMENT ON TABLE mine_disturbance_code IS 'The valid options for a mine commodity type.';

ALTER TABLE mine_type_detail_xref
    ADD COLUMN mine_commodity_code character varying(2),
    ALTER mine_disturbance_code DROP NOT NULL;

-- Foreign Key Definitions
ALTER TABLE mine_type_detail_xref
    ADD CONSTRAINT mine_type_detail_xref_mine_commodity_code_fkey
        FOREIGN KEY (mine_commodity_code)
        REFERENCES mine_commodity_code(mine_commodity_code) DEFERRABLE INITIALLY DEFERRED;

-- Contraints
ALTER TABLE mine_type_detail_xref
    ADD CONSTRAINT commodity_or_disturbance_presence_check CHECK((mine_disturbance_code IS NULL) <> (mine_commodity_code IS NULL));

CREATE UNIQUE INDEX mine_type_guid_mine_commodity_code_active_uniqeness
    ON mine_type_detail_xref (mine_type_guid, mine_commodity_code, active_ind)
    WHERE (active_ind = TRUE);

COMMENT ON TABLE mine_type_detail_xref IS 'A lookup of all valid disturbance and commodity types.';

-- Mine Type
CREATE UNIQUE INDEX mine_guid_mine_tenure_type_code_active_uniqeness
    ON mine_type (mine_guid, mine_tenure_type_code, active_ind)
    WHERE (active_ind = TRUE);

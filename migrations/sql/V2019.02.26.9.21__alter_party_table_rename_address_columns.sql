ALTER TABLE party
    ADD COLUMN address_type_code varchar(3) DEFAULT 'CAN' NOT NULL;

ALTER TABLE party RENAME province_code TO region_code;
ALTER TABLE party RENAME postal_code   TO post_code;
ALTER TABLE party
    RENAME CONSTRAINT "party_province_code_fkey" TO "party_region_code_fkey";

CREATE TABLE IF NOT EXISTS address_type_code (
    address_type_code character varying(3)                   NOT NULL,
    description       character varying(50)                  NOT NULL,
    display_order     integer                                        ,
    active_ind        boolean                  DEFAULT true  NOT NULL,
    create_user       character varying(60)                  NOT NULL,
    create_timestamp  timestamp with time zone DEFAULT now() NOT NULL,
    update_user       character varying(60)                  NOT NULL,
    update_timestamp  timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE address_type_code OWNER TO mds;
COMMENT ON TABLE address_type_code IS 'Lookup table for valid address types';


INSERT INTO address_type_code
    (
    address_type_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('CAN', 'Canada', 10, 'system-mds', 'system-mds'),
    ('USA', 'United States', 20, 'system-mds', 'system-mds'),
    ('INT', 'International', 30, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

ALTER TABLE province_code RENAME TO region_code;
ALTER TABLE region_code RENAME province_code TO region_code;


-- Address Type Lookup FKs
ALTER TABLE ONLY address_type_code
    ADD CONSTRAINT address_type_code_pkey PRIMARY KEY (address_type_code);
ALTER TABLE ONLY party
    ADD CONSTRAINT party_address_type_code_fkey FOREIGN KEY (address_type_code) REFERENCES address_type_code(address_type_code);

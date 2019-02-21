ALTER TABLE party ADD COLUMN suite_no       varchar(5);
ALTER TABLE party ADD COLUMN address_line_1 varchar(50);
ALTER TABLE party ADD COLUMN address_line_2 varchar(50);
ALTER TABLE party ADD COLUMN city           varchar(50);
ALTER TABLE party ADD COLUMN province_code  varchar(2);
ALTER TABLE party ADD COLUMN postal_code    varchar(6);

COMMENT ON TABLE party IS 'Party references an individual or an organization that does business with EMPR, and any relevant contact information, such as address.';

CREATE TABLE IF NOT EXISTS province_code (
    province_code    character varying(2)                   NOT NULL,
    description      character varying(50)                  NOT NULL,
    display_order    integer                                        ,
    active_ind       boolean                  DEFAULT true  NOT NULL,
    create_user      character varying(60)                  NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user      character varying(60)                  NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE province_code OWNER TO mds;
COMMENT ON TABLE province_code IS 'Lookup table for valid province codes';


INSERT INTO province_code
    (
    province_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('AB', 'Alberta', 10, 'system-mds', 'system-mds'),
    ('BC', 'British Columbia', 20, 'system-mds', 'system-mds'),
    ('MB', 'Manitoba', 30, 'system-mds', 'system-mds'),
    ('NB', 'New Brunswick', 40, 'system-mds', 'system-mds'),
    ('NL', 'Newfoundland and Labrador', 50, 'system-mds', 'system-mds'),
    ('NS', 'Nova Scotia', 60, 'system-mds', 'system-mds'),
    ('NT', 'Northwest Territories', 70, 'system-mds', 'system-mds'),
    ('NU', 'Nunavut', 80, 'system-mds', 'system-mds')
    ('ON', 'Ontario', 90, 'system-mds', 'system-mds'),
    ('PE', 'Prince Edward Island', 100, 'system-mds', 'system-mds'),
    ('QC', 'Quebec', 110, 'system-mds', 'system-mds'),
    ('SK', 'Saskatchewan', 120, 'system-mds', 'system-mds'),
    ('YT', 'Yukon', 130, 'system-mds', 'system-mds'),
ON CONFLICT DO NOTHING;


-- Province Lookup FKs
ALTER TABLE ONLY province_code
    ADD CONSTRAINT province_code_pkey PRIMARY KEY (province_code);
ALTER TABLE ONLY party
    ADD CONSTRAINT party_province_code_fkey FOREIGN KEY (province_code) REFERENCES province_code(province_code);

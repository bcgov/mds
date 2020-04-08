CREATE TABLE IF NOT EXISTS regional_contact_type
(
    regional_contact_type_code          character varying(3)                  PRIMARY KEY,
    description                         character varying(100)                   NOT NULL,
    display_order                       integer                                  NOT NULL,
    active_ind                          boolean                     NOT NULL DEFAULT TRUE,

    create_user                         character varying(60)                    NOT NULL,
    create_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                         character varying(60)                    NOT NULL,
    update_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL
);

ALTER TABLE regional_contact_type OWNER TO mds;

COMMENT ON TABLE regional_contact_type IS 'The types of regional contacts.';

INSERT INTO regional_contact_type
    (
    regional_contact_type_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('SHI', 'Senior Health, Safety and Environment Inspector', 30, 'system-mds', 'system-mds'),
    ('SPI', 'Senior Permitting Inspector', 40, 'system-mds', 'system-mds'),
    ('ROE', 'Regional Office', 20, 'system-mds', 'system-mds'),
    ('RDR', 'Regional Director', 10, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS regional_contact
(
    regional_contact_type_code          character varying(3)                     NOT NULL,
    mine_region_code                    character varying(2)                     NOT NULL,
    email                               character varying(254)                           ,
    phone_number                        character varying(12)                            ,
    fax_number                          character varying(12)                            ,
    mailing_address_line_1              character varying(254)                           ,
    mailing_address_line_2              character varying(254)                           ,
    
    FOREIGN KEY (regional_contact_type_code)    REFERENCES regional_contact_type(regional_contact_type_code) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (mine_region_code)              REFERENCES mine_region_code(mine_region_code) DEFERRABLE INITIALLY DEFERRED,
    PRIMARY KEY(regional_contact_type_code, mine_region_code)
);

ALTER TABLE regional_contact OWNER TO mds;

COMMENT ON TABLE regional_contact IS 'Contains regional contacts information.';

INSERT INTO regional_contact
    (
    regional_contact_type_code,
    mine_region_code,
    email,
    phone_number,
    fax_number,
    mailing_address_line_1,
    mailing_address_line_2
    )
VALUES
    ('ROE', 'NE', 'MMD-PrinceGeorge@gov.bc.ca', '250 565-4240', '250 565-4328', '350-1011 4th Avenue', 'Prince George, B.C. V2L 3H9'),
    ('ROE', 'NW', 'MMD-Smithers@gov.bc.ca', '250 847-7383', '250 847-7603', '2nd Floor, 3726 Alfred Avenue', 'Smithers, B.C. V0J 2N0'),
    ('ROE', 'SC', 'MMD-Kamloops@gov.bc.ca', '250 371-3912', NULL, '2nd Floor, 441 Columbia Street', 'Kamloops, B.C. V2C 2T3'),
    ('ROE', 'SE', 'MMD-Cranbrook@gov.bc.ca', '250 417-6134', NULL, '202-100 Cranbrook Street North', 'Cranbrook, B.C. V1C 3P9'),
    ('ROE', 'SW', 'SouthwestMinesDivision@gov.bc.ca', '778 698-3649', '250 953-3878', 'PO Box 9395, STN PROV GOVT', 'Victoria, B.C. V8W 9M9')
ON CONFLICT DO NOTHING;

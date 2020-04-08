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

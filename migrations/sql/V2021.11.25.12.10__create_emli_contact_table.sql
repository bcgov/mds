CREATE TABLE IF NOT EXISTS emli_contact_type (
    emli_contact_type_code              character varying(3)                 PRIMARY KEY,
    description                         character varying(100)                  NOT NULL,
    display_order                       integer                                 NOT NULL,
    active_ind                          boolean DEFAULT true                    NOT NULL,
    create_user                         character varying(60)                   NOT NULL,
    create_timestamp                    timestamp with time zone DEFAULT now()  NOT NULL,
    update_user                         character varying(60)                   NOT NULL,
    update_timestamp                    timestamp with time zone DEFAULT now()  NOT NULL
);

COMMENT ON TABLE emli_contact_type is 'The types of EMLI contacts.';
ALTER TABLE emli_contact_type OWNER TO mds;

--Recreate regional_contact table as emli_contact with additional columns
CREATE TABLE IF NOT EXISTS emli_contact
(
    contact_id                          SERIAL PRIMARY KEY,
	emli_contact_type_code              character varying(3)                     NOT NULL,
    mine_region_code                    character varying(2)                             ,
	first_name                          character varying(100)                           ,
	last_name                           character varying(100)                           ,
    email                               character varying(254)                           ,
    phone_number                        character varying(12)                            ,
    fax_number                          character varying(12)                            ,
    mailing_address_line_1              character varying(254)                           ,
    mailing_address_line_2              character varying(254)                           ,
	is_major_mine                       boolean                    DEFAULT false NOT NULL,
    is_general_contact                  boolean                    DEFAULT false NOT NULL,
    deleted_ind                         boolean                    DEFAULT false NOT NULL,
    create_user                         character varying(60)                   NOT NULL,
    create_timestamp                    timestamp with time zone DEFAULT now()  NOT NULL,
    update_user                         character varying(60)                   NOT NULL,
    update_timestamp                    timestamp with time zone DEFAULT now()  NOT NULL,
    
    CONSTRAINT emli_contact_type_code_fkey FOREIGN KEY (emli_contact_type_code) REFERENCES emli_contact_type(emli_contact_type_code) DEFERRABLE INITIALLY DEFERRED,
    CONSTRAINT mine_region_code_fkey FOREIGN KEY (mine_region_code)             REFERENCES mine_region_code(mine_region_code) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE emli_contact OWNER TO mds;

COMMENT ON TABLE emli_contact IS 'Contains EMLI contacts information.';

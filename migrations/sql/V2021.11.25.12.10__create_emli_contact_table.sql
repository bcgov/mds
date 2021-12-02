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
    
    FOREIGN KEY (emli_contact_type_code)    REFERENCES emli_contact_type(emli_contact_type_code) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (mine_region_code)              REFERENCES mine_region_code(mine_region_code) DEFERRABLE INITIALLY DEFERRED
);

ALTER TABLE emli_contact OWNER TO mds;

COMMENT ON TABLE emli_contact IS 'Contains EMLI contacts information.';

--Create SEQUENCE
DO
$$
BEGIN
   EXECUTE format('
   DROP SEQUENCE IF EXISTS public.emli_contact_id_seq CASCADE;
   CREATE SEQUENCE IF NOT EXISTS public.emli_contact_id_seq
   INCREMENT 1
   START %1$s
   MINVALUE %1$s
   NO MAXVALUE
   CACHE 1;'
 , (SELECT COALESCE ((SELECT MAX(contact_id) FROM emli_contact),1)));
   ALTER SEQUENCE public.emli_contact_id_seq OWNER TO mds;
   GRANT ALL ON SEQUENCE public.emli_contact_id_seq TO mds;
   ALTER TABLE ONLY public.emli_contact ALTER COLUMN contact_id SET DEFAULT nextval('public.emli_contact_id_seq'::regclass);
END
$$;

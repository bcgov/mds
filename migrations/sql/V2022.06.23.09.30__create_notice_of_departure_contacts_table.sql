CREATE TABLE IF NOT EXISTS notice_of_departure_contact
(
    nod_contact_guid uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nod_guid         uuid NOT NULL,
    first_name                       character varying(200) NOT NULL,
    last_name                        character varying(200) NOT NULL,
    email                            character varying(254) NOT NULL,
    phone_number                     character varying(12) NOT NULL,
    is_primary                       boolean DEFAULT true  NOT NULL,
    deleted_ind                      boolean DEFAULT false NOT NULL,
    create_user                      character varying(60) NOT NULL,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL,
    update_user                      character varying(60) NOT NULL,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL,

    CONSTRAINT notice_of_departure_guid_fkey FOREIGN KEY (nod_guid) REFERENCES notice_of_departure(nod_guid)
);
ALTER TABLE notice_of_departure_contact
    OWNER TO mds;
--
-- Name: TABLE project_contact; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE notice_of_departure_contact IS 'Notice of Departure contact details. ';
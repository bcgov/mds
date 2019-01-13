--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry, geography, and raster spatial types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: document_manager; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.document_manager (
    document_manager_id integer NOT NULL,
    document_guid uuid NOT NULL,
    full_storage_path character varying(150) NOT NULL,
    upload_date timestamp with time zone NOT NULL,
    file_display_name character varying(40) NOT NULL,
    path_display_name character varying(150) NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.document_manager OWNER TO mds;

--
-- Name: TABLE document_manager; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.document_manager IS 'documents representations on the file volumes stored in our table structure';


--
-- Name: document_manager_document_manager_id_seq; Type: SEQUENCE; Schema: public; Owner: mds
--

CREATE SEQUENCE public.document_manager_document_manager_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.document_manager_document_manager_id_seq OWNER TO mds;

--
-- Name: document_manager_document_manager_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mds
--

ALTER SEQUENCE public.document_manager_document_manager_id_seq OWNED BY public.document_manager.document_manager_id;

--
-- Name: mds_required_document; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mds_required_document (
    req_document_guid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    req_document_name character varying(100) NOT NULL,
    req_document_description character varying(300),
    req_document_category_guid uuid NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    req_document_due_date_period_months integer,
    req_document_due_date_type character varying(3)
);


ALTER TABLE public.mds_required_document OWNER TO mds;

--
-- Name: TABLE mds_required_document; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mds_required_document IS 'A mds_required_document is a document defined in the code, but is not strictly a single file, acts as a default reporting requirement';


--
-- Name: mds_required_document_category; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mds_required_document_category (
    req_document_category_guid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    req_document_category character varying(60) NOT NULL,
    active_ind boolean DEFAULT true NOT NULL
);


ALTER TABLE public.mds_required_document_category OWNER TO mds;

--
-- Name: TABLE mds_required_document_category; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mds_required_document_category IS 'A mds_required_document_category is fixed tag on an mds_required_document for searching';


--
-- Name: mine; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine (
    mine_guid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    mine_no character varying(10) DEFAULT ''::character varying NOT NULL,
    mine_name character varying(60) DEFAULT ''::character varying NOT NULL,
    mine_note character varying(300) DEFAULT ''::character varying NOT NULL,
    major_mine_ind boolean DEFAULT false NOT NULL,
    mine_region character varying(2),
    deleted_ind boolean DEFAULT false NOT NULL
);


ALTER TABLE public.mine OWNER TO mds;

--
-- Name: TABLE mine; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mine IS 'Unique entry denoting the existence of a mine in British Columbia.';


--
-- Name: mine_commodity_code; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_commodity_code (
    mine_commodity_code character varying(2) NOT NULL,
    description character varying(100) NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.mine_commodity_code OWNER TO mds;

--
-- Name: TABLE mine_commodity_code; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mine_commodity_code IS 'The valid options for a mine commodity type.';


--
-- Name: mine_disturbance_code; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_disturbance_code (
    mine_disturbance_code character varying(3) NOT NULL,
    description character varying(100) NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.mine_disturbance_code OWNER TO mds;

--
-- Name: TABLE mine_disturbance_code; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mine_disturbance_code IS 'The valid options for a mine disturbance type.';


--
-- Name: mine_document; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_document (
    mine_document_guid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    mine_guid uuid NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    document_name character varying(40) NOT NULL,
    document_manager_guid uuid NOT NULL
);


ALTER TABLE public.mine_document OWNER TO mds;

--
-- Name: TABLE mine_document; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mine_document IS 'an mds record of a document stored in the document manager microservice';


--
-- Name: mine_expected_document; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_expected_document (
    exp_document_guid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    req_document_guid uuid,
    mine_guid uuid NOT NULL,
    exp_document_name character varying(100) NOT NULL,
    exp_document_description character varying(300),
    due_date date,
    active_ind boolean DEFAULT true NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    received_date date,
    exp_document_status_guid uuid
);


ALTER TABLE public.mine_expected_document OWNER TO mds;

--
-- Name: TABLE mine_expected_document; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mine_expected_document IS 'Values for expected document statuses.';


--
-- Name: mine_expected_document_status; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_expected_document_status (
    exp_document_status_guid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    description character varying(100) NOT NULL,
    display_order smallint NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.mine_expected_document_status OWNER TO mds;

--
-- Name: mine_expected_document_xref; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_expected_document_xref (
    mine_exp_document_xref_guid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    mine_document_guid uuid NOT NULL,
    exp_document_guid uuid NOT NULL
);


ALTER TABLE public.mine_expected_document_xref OWNER TO mds;

--
-- Name: TABLE mine_expected_document_xref; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mine_expected_document_xref IS 'A mine_expected_document_xref entry is the join between the actual document artifact and the expectation that the document satisfies. an expectation can also be statisfied by multiple documents';


--
-- Name: mine_location; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_location (
    mine_location_guid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    mine_guid uuid NOT NULL,
    latitude numeric(9,7) NOT NULL,
    longitude numeric(11,7) NOT NULL,
    effective_date date DEFAULT now() NOT NULL,
    expiry_date date DEFAULT '9999-12-31'::date NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    geom public.geometry(Point,3005)
);


ALTER TABLE public.mine_location OWNER TO mds;

--
-- Name: TABLE mine_location; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mine_location IS 'FCBC staging tables hold up to NUMBER(9,7) for Latitude and NUMBER(11,7) for Longitude.';


--
-- Name: mine_map_view; Type: VIEW; Schema: public; Owner: mds
--

CREATE VIEW public.mine_map_view AS
 SELECT mi.mine_guid,
    ml.latitude,
    ml.longitude,
    mi.mine_no,
    mi.mine_name
   FROM (public.mine mi
     JOIN public.mine_location ml ON ((ml.mine_guid = mi.mine_guid)));


ALTER TABLE public.mine_map_view OWNER TO mds;

--
-- Name: mine_operation_status_code; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_operation_status_code (
    mine_operation_status_code character varying(3) NOT NULL,
    description character varying(100) NOT NULL,
    display_order smallint,
    effective_date date DEFAULT now() NOT NULL,
    expiry_date date DEFAULT '9999-12-31'::date NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT display_order_max_length CHECK ((display_order < 1000))
);


ALTER TABLE public.mine_operation_status_code OWNER TO mds;

--
-- Name: TABLE mine_operation_status_code; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mine_operation_status_code IS 'This mine_operation_status_code table is the top level in the hierarchy of classifying a mine.';


--
-- Name: mine_operation_status_reason_code; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_operation_status_reason_code (
    mine_operation_status_reason_code character varying(3) NOT NULL,
    description character varying(100) NOT NULL,
    display_order smallint,
    effective_date date DEFAULT now() NOT NULL,
    expiry_date date DEFAULT '9999-12-31'::date NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT display_order_max_length CHECK ((display_order < 1000))
);


ALTER TABLE public.mine_operation_status_reason_code OWNER TO mds;

--
-- Name: TABLE mine_operation_status_reason_code; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mine_operation_status_reason_code IS 'This mine_operation_status_reason_code table is the second level in the hierarchy of classifying a mine and is one level below mine_operation_status_code.';


--
-- Name: mine_operation_status_sub_reason_code; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_operation_status_sub_reason_code (
    mine_operation_status_sub_reason_code character varying(3) NOT NULL,
    description character varying(100) NOT NULL,
    display_order smallint,
    effective_date date DEFAULT now() NOT NULL,
    expiry_date date DEFAULT '9999-12-31'::date NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT display_order_max_length CHECK ((display_order < 1000))
);


ALTER TABLE public.mine_operation_status_sub_reason_code OWNER TO mds;

--
-- Name: TABLE mine_operation_status_sub_reason_code; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mine_operation_status_sub_reason_code IS 'This mine_operation_status_sub_reason_code table is the third level in the hierarchy of classifying a mine and is one level below mine_operation_status_reason_code.';


--
-- Name: mine_party_appt; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_party_appt (
    mine_party_appt_id integer NOT NULL,
    mine_party_appt_guid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    mine_guid uuid NOT NULL,
    party_guid uuid NOT NULL,
    mine_party_appt_type_code character varying(3) NOT NULL,
    effective_date date DEFAULT now() NOT NULL,
    expiry_date date DEFAULT '9999-12-31'::date NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    mine_tailings_storage_facility_guid uuid,
    permit_guid uuid,
    start_date date,
    end_date date,
    deleted_ind boolean DEFAULT false NOT NULL
);


ALTER TABLE public.mine_party_appt OWNER TO mds;

--
-- Name: mine_party_appt_mine_party_appt_id_seq; Type: SEQUENCE; Schema: public; Owner: mds
--

CREATE SEQUENCE public.mine_party_appt_mine_party_appt_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.mine_party_appt_mine_party_appt_id_seq OWNER TO mds;

--
-- Name: mine_party_appt_mine_party_appt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: mds
--

ALTER SEQUENCE public.mine_party_appt_mine_party_appt_id_seq OWNED BY public.mine_party_appt.mine_party_appt_id;


--
-- Name: mine_party_appt_type_code; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_party_appt_type_code (
    mine_party_appt_type_code character varying(3) NOT NULL,
    description character varying(100) NOT NULL,
    display_order integer,
    active_ind boolean DEFAULT true NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    person boolean DEFAULT false NOT NULL,
    organization boolean DEFAULT false NOT NULL,
    grouping_level integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.mine_party_appt_type_code OWNER TO mds;

--
-- Name: mine_region_code; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_region_code (
    mine_region_code character varying(2) NOT NULL,
    description character varying(100) NOT NULL,
    display_order smallint NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    effective_date date DEFAULT now() NOT NULL,
    expiry_date date DEFAULT '9999-12-31'::date NOT NULL,
    CONSTRAINT display_order_max_length CHECK ((display_order < 1000))
);


ALTER TABLE public.mine_region_code OWNER TO mds;

--
-- Name: mine_status; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_status (
    mine_status_guid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    mine_guid uuid NOT NULL,
    mine_status_xref_guid uuid NOT NULL,
    effective_date date DEFAULT now() NOT NULL,
    expiry_date date DEFAULT '9999-12-31'::date NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.mine_status OWNER TO mds;

--
-- Name: TABLE mine_status; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mine_status IS 'This mine_status table contains a specific mine''s operational status over time.';


--
-- Name: mine_status_xref; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_status_xref (
    mine_status_xref_guid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    mine_operation_status_code character varying(3) NOT NULL,
    mine_operation_status_reason_code character varying(3),
    mine_operation_status_sub_reason_code character varying(3),
    effective_date date DEFAULT now() NOT NULL,
    expiry_date date DEFAULT '9999-12-31'::date NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.mine_status_xref OWNER TO mds;

--
-- Name: TABLE mine_status_xref; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mine_status_xref IS 'This mine_status_xref table contains a lookup of all valid operational states a mine could be in at a given time. This table is maintained by the business as it contains a hierarchy of valid statuses and reasons.';


--
-- Name: mine_tailings_storage_facility; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_tailings_storage_facility (
    mine_tailings_storage_facility_guid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    mine_tailings_storage_facility_name character varying(60) NOT NULL,
    mine_guid uuid NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.mine_tailings_storage_facility OWNER TO mds;

--
-- Name: TABLE mine_tailings_storage_facility; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mine_tailings_storage_facility IS 'Stores the information relavent to a mine tailings storage facility.';


--
-- Name: mine_tenure_type_code; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_tenure_type_code (
    mine_tenure_type_code character varying(3) NOT NULL,
    description character varying(30) NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    active_ind boolean DEFAULT true NOT NULL
);


ALTER TABLE public.mine_tenure_type_code OWNER TO mds;

--
-- Name: TABLE mine_tenure_type_code; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mine_tenure_type_code IS 'A valid mine tenure type value to be referenced by mine_type.';


--
-- Name: mine_type; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_type (
    mine_type_guid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    mine_guid uuid NOT NULL,
    mine_tenure_type_code character varying(3) NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    active_ind boolean DEFAULT true NOT NULL
);


ALTER TABLE public.mine_type OWNER TO mds;

--
-- Name: TABLE mine_type; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mine_type IS 'The intersection of a mine_tenure_type with other mine information, such as commodity type and/or disturbance type';


--
-- Name: mine_type_detail_xref; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mine_type_detail_xref (
    mine_type_detail_xref_guid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    mine_disturbance_code character varying(3),
    mine_type_guid uuid NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    mine_commodity_code character varying(2),
    CONSTRAINT commodity_or_disturbance_presence_check CHECK (((mine_disturbance_code IS NULL) <> (mine_commodity_code IS NULL)))
);


ALTER TABLE public.mine_type_detail_xref OWNER TO mds;

--
-- Name: TABLE mine_type_detail_xref; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mine_type_detail_xref IS 'A lookup of all valid disturbance and commodity types.';


--
-- Name: mineral_tenure_xref; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.mineral_tenure_xref (
    mineral_tenure_xref_guid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    mine_guid uuid NOT NULL,
    tenure_number_id numeric(10,0) NOT NULL,
    effective_date date DEFAULT now() NOT NULL,
    expiry_date date DEFAULT '9999-12-31'::date NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.mineral_tenure_xref OWNER TO mds;

--
-- Name: TABLE mineral_tenure_xref; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.mineral_tenure_xref IS 'A cross-reference to the official Mineral Tenure(s) associated with this mine, via the Owner.';


--
-- Name: COLUMN mineral_tenure_xref.effective_date; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON COLUMN public.mineral_tenure_xref.effective_date IS 'Calendar date upon this cross-reference is accepted as true (time component implicitly 00:00:00.00).';


--
-- Name: COLUMN mineral_tenure_xref.expiry_date; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON COLUMN public.mineral_tenure_xref.expiry_date IS 'Calendar date after which this cross-reference is accepted as no longer true (time component implicitly 23:59:59.99).';


--
-- Name: party; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.party (
    party_guid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    first_name character varying(100),
    party_name character varying(100) NOT NULL,
    phone_no character varying(12) NOT NULL,
    phone_ext character varying(4),
    email character varying(254) NOT NULL,
    effective_date date DEFAULT now() NOT NULL,
    expiry_date date DEFAULT '9999-12-31'::date NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    middle_name character varying(100),
    party_type_code character varying(3) NOT NULL
);


ALTER TABLE public.party OWNER TO mds;

--
-- Name: TABLE party; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.party IS 'Column party_name refers to either a surname for a person or the company name';


--
-- Name: party_type_code; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.party_type_code (
    party_type_code character varying(3) NOT NULL,
    description character varying(100) NOT NULL,
    display_order integer,
    effective_date date DEFAULT now() NOT NULL,
    expiry_date date DEFAULT '9999-12-31'::date NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT display_order_max_length CHECK ((display_order < 1000))
);


ALTER TABLE public.party_type_code OWNER TO mds;

--
-- Name: permit; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.permit (
    permit_guid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    mine_guid uuid NOT NULL,
    permit_no character varying(12) NOT NULL,
    received_date date DEFAULT '9999-12-31'::date NOT NULL,
    issue_date date DEFAULT '9999-12-31'::date NOT NULL,
    permit_status_code character varying(2) NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    expiry_date date DEFAULT '9999-12-31'::date NOT NULL
);


ALTER TABLE public.permit OWNER TO mds;

--
-- Name: permit_status_code; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.permit_status_code (
    permit_status_code character varying(2) NOT NULL,
    description character varying(100) NOT NULL,
    display_order smallint,
    effective_date date DEFAULT now() NOT NULL,
    expiry_date date DEFAULT '9999-12-31'::date NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT display_order_max_length CHECK ((display_order < 1000))
);


ALTER TABLE public.permit_status_code OWNER TO mds;

--
-- Name: required_document_due_date_type; Type: TABLE; Schema: public; Owner: mds
--

CREATE TABLE public.required_document_due_date_type (
    req_document_due_date_type character varying(3) NOT NULL,
    req_document_due_date_description character varying(60) NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.required_document_due_date_type OWNER TO mds;

--
-- Name: TABLE required_document_due_date_type; Type: COMMENT; Schema: public; Owner: mds
--

COMMENT ON TABLE public.required_document_due_date_type IS 'A required_document_due_date_type is fixed tag on an mds_required_document for to indicate the rules around when it is due';


--
-- Name: document_manager document_manager_id; Type: DEFAULT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.document_manager ALTER COLUMN document_manager_id SET DEFAULT nextval('public.document_manager_document_manager_id_seq'::regclass);


--
-- Name: mine_party_appt mine_party_appt_id; Type: DEFAULT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_party_appt ALTER COLUMN mine_party_appt_id SET DEFAULT nextval('public.mine_party_appt_mine_party_appt_id_seq'::regclass);


--
-- Name: document_manager document_manager_pk; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.document_manager
    ADD CONSTRAINT document_manager_pk PRIMARY KEY (document_manager_id);

--
-- Name: mds_required_document_category mds_required_document_category_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mds_required_document_category
    ADD CONSTRAINT mds_required_document_category_pkey PRIMARY KEY (req_document_category_guid);


--
-- Name: mds_required_document mds_required_document_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mds_required_document
    ADD CONSTRAINT mds_required_document_pkey PRIMARY KEY (req_document_guid);


--
-- Name: mine_commodity_code mine_commodity_code_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_commodity_code
    ADD CONSTRAINT mine_commodity_code_pkey PRIMARY KEY (mine_commodity_code);


--
-- Name: mine_disturbance_code mine_disturbance_code_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_disturbance_code
    ADD CONSTRAINT mine_disturbance_code_pkey PRIMARY KEY (mine_disturbance_code);


--
-- Name: mine_document mine_document_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_document
    ADD CONSTRAINT mine_document_pkey PRIMARY KEY (mine_document_guid);


--
-- Name: mine_expected_document mine_expected_document_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_expected_document
    ADD CONSTRAINT mine_expected_document_pkey PRIMARY KEY (exp_document_guid);


--
-- Name: mine_expected_document_status mine_expected_document_status_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_expected_document_status
    ADD CONSTRAINT mine_expected_document_status_pkey PRIMARY KEY (exp_document_status_guid);


--
-- Name: mine_expected_document_xref mine_expected_document_xref_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_expected_document_xref
    ADD CONSTRAINT mine_expected_document_xref_pkey PRIMARY KEY (mine_exp_document_xref_guid);


--
-- Name: mine mine_identity_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine
    ADD CONSTRAINT mine_identity_pkey PRIMARY KEY (mine_guid);


--
-- Name: mine_location mine_location_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_location
    ADD CONSTRAINT mine_location_pkey PRIMARY KEY (mine_location_guid);


--
-- Name: mine_operation_status_code mine_operation_status_code_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_operation_status_code
    ADD CONSTRAINT mine_operation_status_code_pkey PRIMARY KEY (mine_operation_status_code);


--
-- Name: mine_operation_status_reason_code mine_operation_status_reason_code_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_operation_status_reason_code
    ADD CONSTRAINT mine_operation_status_reason_code_pkey PRIMARY KEY (mine_operation_status_reason_code);


--
-- Name: mine_operation_status_sub_reason_code mine_operation_status_sub_reason_code_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_operation_status_sub_reason_code
    ADD CONSTRAINT mine_operation_status_sub_reason_code_pkey PRIMARY KEY (mine_operation_status_sub_reason_code);


--
-- Name: mine_party_appt mine_party_appt_pk; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_party_appt
    ADD CONSTRAINT mine_party_appt_pk PRIMARY KEY (mine_party_appt_id);


--
-- Name: permit mine_permit_guid_unique; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.permit
    ADD CONSTRAINT mine_permit_guid_unique UNIQUE (permit_guid, mine_guid);


--
-- Name: mine_region_code mine_region_code_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_region_code
    ADD CONSTRAINT mine_region_code_pkey PRIMARY KEY (mine_region_code);


--
-- Name: mine_status mine_status_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_status
    ADD CONSTRAINT mine_status_pkey PRIMARY KEY (mine_status_guid);


--
-- Name: mine_status_xref mine_status_xref_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_status_xref
    ADD CONSTRAINT mine_status_xref_pkey PRIMARY KEY (mine_status_xref_guid);


--
-- Name: mine_tailings_storage_facility mine_tailings_storage_facility_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_tailings_storage_facility
    ADD CONSTRAINT mine_tailings_storage_facility_pkey PRIMARY KEY (mine_tailings_storage_facility_guid);


--
-- Name: mine_tenure_type_code mine_tenure_type_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_tenure_type_code
    ADD CONSTRAINT mine_tenure_type_pkey PRIMARY KEY (mine_tenure_type_code);


--
-- Name: mine_type_detail_xref mine_type_detail_xref_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_type_detail_xref
    ADD CONSTRAINT mine_type_detail_xref_pkey PRIMARY KEY (mine_type_detail_xref_guid);


--
-- Name: mine_type mine_type_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_type
    ADD CONSTRAINT mine_type_pkey PRIMARY KEY (mine_type_guid);


--
-- Name: mineral_tenure_xref mineral_tenure_xref_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mineral_tenure_xref
    ADD CONSTRAINT mineral_tenure_xref_pkey PRIMARY KEY (mineral_tenure_xref_guid);


--
-- Name: mine_tailings_storage_facility mines_tsf_guid_mine_guid_unique; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_tailings_storage_facility
    ADD CONSTRAINT mines_tsf_guid_mine_guid_unique UNIQUE (mine_tailings_storage_facility_guid, mine_guid);


--
-- Name: mine_party_appt_type_code party_mine_xref_type_code_pk; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_party_appt_type_code
    ADD CONSTRAINT party_mine_xref_type_code_pk PRIMARY KEY (mine_party_appt_type_code);


--
-- Name: party_type_code party_type_code_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.party_type_code
    ADD CONSTRAINT party_type_code_pkey PRIMARY KEY (party_type_code);


--
-- Name: permit permit_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.permit
    ADD CONSTRAINT permit_pkey PRIMARY KEY (permit_guid);


--
-- Name: permit_status_code permit_status_code_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.permit_status_code
    ADD CONSTRAINT permit_status_code_pkey PRIMARY KEY (permit_status_code);


--
-- Name: party person_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.party
    ADD CONSTRAINT person_pkey PRIMARY KEY (party_guid);


--
-- Name: required_document_due_date_type required_document_due_date_type_pkey; Type: CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.required_document_due_date_type
    ADD CONSTRAINT required_document_due_date_type_pkey PRIMARY KEY (req_document_due_date_type);


--
-- Name: document_manager_document_guid_idx; Type: INDEX; Schema: public; Owner: mds
--

CREATE INDEX document_manager_document_guid_idx ON public.document_manager USING btree (document_guid);

--
-- Name: mine_guid_mine_tenure_type_code_active_uniqeness; Type: INDEX; Schema: public; Owner: mds
--

CREATE UNIQUE INDEX mine_guid_mine_tenure_type_code_active_uniqeness ON public.mine_type USING btree (mine_guid, mine_tenure_type_code, active_ind) WHERE (active_ind = true);


--
-- Name: mine_location_geom_idx; Type: INDEX; Schema: public; Owner: mds
--

CREATE INDEX mine_location_geom_idx ON public.mine_location USING gist (geom);


--
-- Name: mine_location_lat_long_idx; Type: INDEX; Schema: public; Owner: mds
--

CREATE INDEX mine_location_lat_long_idx ON public.mine_location USING btree (latitude, longitude);


--
-- Name: mine_location_mine_guid_idx; Type: INDEX; Schema: public; Owner: mds
--

CREATE INDEX mine_location_mine_guid_idx ON public.mine_location USING btree (mine_guid);


--
-- Name: mine_party_appt_guid_idx; Type: INDEX; Schema: public; Owner: mds
--

CREATE INDEX mine_party_appt_guid_idx ON public.mine_party_appt USING btree (mine_party_appt_guid);


--
-- Name: mine_status_mine_guid_idx; Type: INDEX; Schema: public; Owner: mds
--

CREATE INDEX mine_status_mine_guid_idx ON public.mine_status USING btree (mine_guid);


--
-- Name: mine_type_detail_xref_update_timestamp_idx; Type: INDEX; Schema: public; Owner: mds
--

CREATE INDEX mine_type_detail_xref_update_timestamp_idx ON public.mine_type_detail_xref USING btree (update_timestamp);


--
-- Name: mine_type_guid_mine_commodity_code_active_uniqeness; Type: INDEX; Schema: public; Owner: mds
--

CREATE UNIQUE INDEX mine_type_guid_mine_commodity_code_active_uniqeness ON public.mine_type_detail_xref USING btree (mine_type_guid, mine_commodity_code, active_ind) WHERE (active_ind = true);


--
-- Name: mine_type_guid_mine_disturbance_code_active_uniqeness; Type: INDEX; Schema: public; Owner: mds
--

CREATE UNIQUE INDEX mine_type_guid_mine_disturbance_code_active_uniqeness ON public.mine_type_detail_xref USING btree (mine_type_guid, mine_disturbance_code, active_ind) WHERE (active_ind = true);


--
-- Name: mine_type_mine_guid_idx; Type: INDEX; Schema: public; Owner: mds
--

CREATE INDEX mine_type_mine_guid_idx ON public.mine_type USING btree (mine_guid);


--
-- Name: mine_type_tenure_type_code_idx; Type: INDEX; Schema: public; Owner: mds
--

CREATE INDEX mine_type_tenure_type_code_idx ON public.mine_type USING btree (mine_tenure_type_code);


--
-- Name: mine_type_tenure_type_id_idx; Type: INDEX; Schema: public; Owner: mds
--

CREATE INDEX mine_type_tenure_type_id_idx ON public.mine_type USING btree (mine_tenure_type_code);


--
-- Name: mine_type_update_timestamp_idx; Type: INDEX; Schema: public; Owner: mds
--

CREATE INDEX mine_type_update_timestamp_idx ON public.mine_type USING btree (update_timestamp);


--
-- Name: mineral_tenure_mine_guid_idx; Type: INDEX; Schema: public; Owner: mds
--

CREATE INDEX mineral_tenure_mine_guid_idx ON public.mineral_tenure_xref USING btree (mine_guid);


--
-- Name: mineral_tenure_xref_tenure_no_idx; Type: INDEX; Schema: public; Owner: mds
--

CREATE INDEX mineral_tenure_xref_tenure_no_idx ON public.mineral_tenure_xref USING btree (tenure_number_id);


--
-- Name: mineral_tenure_xref_update_timestamp_idx; Type: INDEX; Schema: public; Owner: mds
--

CREATE INDEX mineral_tenure_xref_update_timestamp_idx ON public.mineral_tenure_xref USING btree (update_timestamp);


--
-- Name: permit_mine_guid_idx; Type: INDEX; Schema: public; Owner: mds
--

CREATE INDEX permit_mine_guid_idx ON public.permit USING btree (mine_guid);


--
-- Name: mds_required_document mds_required_document_req_document_category_guid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mds_required_document
    ADD CONSTRAINT mds_required_document_req_document_category_guid_fkey FOREIGN KEY (req_document_category_guid) REFERENCES public.mds_required_document_category(req_document_category_guid) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mds_required_document mds_required_document_req_document_due_date_type_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mds_required_document
    ADD CONSTRAINT mds_required_document_req_document_due_date_type_fkey FOREIGN KEY (req_document_due_date_type) REFERENCES public.required_document_due_date_type(req_document_due_date_type) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine_document mine_document_mine_guid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_document
    ADD CONSTRAINT mine_document_mine_guid_fkey FOREIGN KEY (mine_guid) REFERENCES public.mine(mine_guid) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine_expected_document mine_expected_document_exp_document_status_guid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_expected_document
    ADD CONSTRAINT mine_expected_document_exp_document_status_guid_fkey FOREIGN KEY (exp_document_status_guid) REFERENCES public.mine_expected_document_status(exp_document_status_guid) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine_expected_document mine_expected_document_mine_guid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_expected_document
    ADD CONSTRAINT mine_expected_document_mine_guid_fkey FOREIGN KEY (mine_guid) REFERENCES public.mine(mine_guid) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine_expected_document mine_expected_document_req_document_guid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_expected_document
    ADD CONSTRAINT mine_expected_document_req_document_guid_fkey FOREIGN KEY (req_document_guid) REFERENCES public.mds_required_document(req_document_guid) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine_expected_document_xref mine_expected_document_xref_exp_document_guid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_expected_document_xref
    ADD CONSTRAINT mine_expected_document_xref_exp_document_guid_fkey FOREIGN KEY (exp_document_guid) REFERENCES public.mine_expected_document(exp_document_guid) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine_expected_document_xref mine_expected_document_xref_mine_document_guid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_expected_document_xref
    ADD CONSTRAINT mine_expected_document_xref_mine_document_guid_fkey FOREIGN KEY (mine_document_guid) REFERENCES public.mine_document(mine_document_guid) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine mine_identity_mine_region_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine
    ADD CONSTRAINT mine_identity_mine_region_fkey FOREIGN KEY (mine_region) REFERENCES public.mine_region_code(mine_region_code);


--
-- Name: mine_location mine_location_mine_guid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_location
    ADD CONSTRAINT mine_location_mine_guid_fkey FOREIGN KEY (mine_guid) REFERENCES public.mine(mine_guid) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine_party_appt mine_party_appt_mine_identity_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_party_appt
    ADD CONSTRAINT mine_party_appt_mine_identity_fkey FOREIGN KEY (mine_guid) REFERENCES public.mine(mine_guid);


--
-- Name: mine_party_appt mine_party_appt_mine_party_appt_type_code_fk; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_party_appt
    ADD CONSTRAINT mine_party_appt_mine_party_appt_type_code_fk FOREIGN KEY (mine_party_appt_type_code) REFERENCES public.mine_party_appt_type_code(mine_party_appt_type_code);


--
-- Name: mine_party_appt mine_party_appt_mine_tailings_storage_facility_mine_guid_fk; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_party_appt
    ADD CONSTRAINT mine_party_appt_mine_tailings_storage_facility_mine_guid_fk FOREIGN KEY (mine_tailings_storage_facility_guid, mine_guid) REFERENCES public.mine_tailings_storage_facility(mine_tailings_storage_facility_guid, mine_guid);


--
-- Name: mine_party_appt mine_party_appt_party_fk; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_party_appt
    ADD CONSTRAINT mine_party_appt_party_fk FOREIGN KEY (party_guid) REFERENCES public.party(party_guid);


--
-- Name: mine_party_appt mine_party_appt_permit_party_fk; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_party_appt
    ADD CONSTRAINT mine_party_appt_permit_party_fk FOREIGN KEY (permit_guid, mine_guid) REFERENCES public.permit(permit_guid, mine_guid);


--
-- Name: mine_status mine_status_mine_guid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_status
    ADD CONSTRAINT mine_status_mine_guid_fkey FOREIGN KEY (mine_guid) REFERENCES public.mine(mine_guid) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine_status mine_status_mine_status_xref_guid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_status
    ADD CONSTRAINT mine_status_mine_status_xref_guid_fkey FOREIGN KEY (mine_status_xref_guid) REFERENCES public.mine_status_xref(mine_status_xref_guid) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine_status_xref mine_status_xref_mine_operation_status_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_status_xref
    ADD CONSTRAINT mine_status_xref_mine_operation_status_code_fkey FOREIGN KEY (mine_operation_status_code) REFERENCES public.mine_operation_status_code(mine_operation_status_code) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine_status_xref mine_status_xref_mine_operation_status_reason_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_status_xref
    ADD CONSTRAINT mine_status_xref_mine_operation_status_reason_code_fkey FOREIGN KEY (mine_operation_status_reason_code) REFERENCES public.mine_operation_status_reason_code(mine_operation_status_reason_code) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine_status_xref mine_status_xref_mine_operation_status_sub_reason_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_status_xref
    ADD CONSTRAINT mine_status_xref_mine_operation_status_sub_reason_code_fkey FOREIGN KEY (mine_operation_status_sub_reason_code) REFERENCES public.mine_operation_status_sub_reason_code(mine_operation_status_sub_reason_code) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine_tailings_storage_facility mine_tailings_storage_facility_mine_guid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_tailings_storage_facility
    ADD CONSTRAINT mine_tailings_storage_facility_mine_guid_fkey FOREIGN KEY (mine_guid) REFERENCES public.mine(mine_guid) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine_type_detail_xref mine_type_detail_xref_mine_commodity_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_type_detail_xref
    ADD CONSTRAINT mine_type_detail_xref_mine_commodity_code_fkey FOREIGN KEY (mine_commodity_code) REFERENCES public.mine_commodity_code(mine_commodity_code) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine_type_detail_xref mine_type_detail_xref_mine_disturbance_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_type_detail_xref
    ADD CONSTRAINT mine_type_detail_xref_mine_disturbance_code_fkey FOREIGN KEY (mine_disturbance_code) REFERENCES public.mine_disturbance_code(mine_disturbance_code) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine_type_detail_xref mine_type_detail_xref_mine_type_guid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_type_detail_xref
    ADD CONSTRAINT mine_type_detail_xref_mine_type_guid_fkey FOREIGN KEY (mine_type_guid) REFERENCES public.mine_type(mine_type_guid) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine_type mine_type_mine_guid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_type
    ADD CONSTRAINT mine_type_mine_guid_fkey FOREIGN KEY (mine_guid) REFERENCES public.mine(mine_guid) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mine_type mine_type_mine_tenure_type_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mine_type
    ADD CONSTRAINT mine_type_mine_tenure_type_code_fkey FOREIGN KEY (mine_tenure_type_code) REFERENCES public.mine_tenure_type_code(mine_tenure_type_code) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: mineral_tenure_xref mineral_tenure_xref_mine_guid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.mineral_tenure_xref
    ADD CONSTRAINT mineral_tenure_xref_mine_guid_fkey FOREIGN KEY (mine_guid) REFERENCES public.mine(mine_guid) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: party party_party_type_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.party
    ADD CONSTRAINT party_party_type_code_fkey FOREIGN KEY (party_type_code) REFERENCES public.party_type_code(party_type_code);


--
-- Name: permit permit_mine_guid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.permit
    ADD CONSTRAINT permit_mine_guid_fkey FOREIGN KEY (mine_guid) REFERENCES public.mine(mine_guid) DEFERRABLE INITIALLY DEFERRED;


--
-- Name: permit permit_permit_status_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: mds
--

ALTER TABLE ONLY public.permit
    ADD CONSTRAINT permit_permit_status_code_fkey FOREIGN KEY (permit_status_code) REFERENCES public.permit_status_code(permit_status_code) DEFERRABLE INITIALLY DEFERRED;


--
-- PostgreSQL database dump complete
--


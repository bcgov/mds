CREATE TYPE dam_type AS ENUM ('dam');
CREATE TYPE operating_status AS ENUM
    (
    'construction',
    'operation',
    'care_and_maintenance',
    'closure_transition',
    'closure_active_care',
    'closure_passive_care'
    );
CREATE TYPE consequence_classification AS ENUM
    (
    'LOW',
    'HIG',
    'SIG',
    'VHIG',
    'EXT',
    'NOD'
    );

CREATE TABLE IF NOT EXISTS dam (
    dam_guid uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    mine_tailings_storage_facility_guid uuid NOT NULL,
    dam_type dam_type NOT NULL,
    dam_name character varying(200) NOT NULL,
    latitude numeric(9,7) NOT NULL,
    longitude numeric(11,7) NOT NULL,
    operating_status operating_status NOT NULL,
    consequence_classification consequence_classification NOT NULL,
    permitted_dam_crest_elevation numeric(10,2) NOT NULL,
    current_dam_height numeric(10,2) NOT NULL,
    current_elevation numeric(10,2) NOT NULL,
    max_pond_elevation numeric(10,2) NOT NULL,
    min_freeboard_required numeric(10,2) NOT NULL,
    deleted_ind boolean DEFAULT false NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,


    CONSTRAINT fk_mine_tailings_storage_facility_guid FOREIGN KEY (mine_tailings_storage_facility_guid) REFERENCES mine_tailings_storage_facility(mine_tailings_storage_facility_guid)
);

ALTER TABLE dam
    OWNER TO mds;

COMMENT ON TABLE dam IS 'A table containing dam information for tailings storage facilities.';

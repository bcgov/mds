
CREATE TABLE IF NOT EXISTS government_agency_type
(
    government_agency_type_code varchar(3) PRIMARY KEY,
    description varchar NOT NULL,
    active_ind boolean,
    create_user varchar NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user varchar NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE government_agency_type OWNER TO mds;

INSERT INTO government_agency_type
    (
    government_agency_type_code,
    description,
    active_ind,
    create_user,
    update_user
    )
VALUES
    ('FLN', 'FLNRORD', TRUE, 'system-mds', 'system-mds'),
    ('MOT', 'MOTI', TRUE, 'system-mds', 'system-mds'),
    ('OGC', 'OGC', TRUE, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

ALTER TABLE mine ADD COLUMN IF NOT EXISTS government_agency_type_code varchar(3);

ALTER TABLE ONLY mine
    ADD CONSTRAINT mine_government_agency_type_fkey FOREIGN KEY (government_agency_type_code) REFERENCES government_agency_type(government_agency_type_code);

UPDATE EXEMPTION_FEE_STATUS
SET ACTIVE_IND = FALSE
WHERE exemption_fee_status_code NOT IN('Y');
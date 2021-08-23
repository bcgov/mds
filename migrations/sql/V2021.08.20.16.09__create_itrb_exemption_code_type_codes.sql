CREATE TABLE IF NOT EXISTS itrb_exemption_status (
    itrb_exemption_status_code       varchar                                NOT NULL PRIMARY KEY,
    description                      varchar                                NOT NULL            ,
    active_ind                       boolean                  DEFAULT true  NOT NULL            ,
    create_user                      varchar                                NOT NULL            ,
    display_order					 smallint                               NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL            ,
    update_user                      varchar                                NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE itrb_exemption_status OWNER TO mds;

INSERT INTO itrb_exemption_status
    (
    itrb_exemption_status_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('NO', 'No', 10, 'system-mds', 'system-mds'),
    ('YES', 'Yes', 20, 'system-mds', 'system-mds'),
    ('EXEM', 'Exemption', 30, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

ALTER TABLE mine_tailings_storage_facility ADD COLUMN IF NOT EXISTS itrb_exemption_status_code varchar REFERENCES itrb_exemption_status(itrb_exemption_status_code);

UPDATE mine_tailings_storage_facility SET itrb_exemption_status_code = 'YES' WHERE has_itrb = 'true';

UPDATE mine_tailings_storage_facility SET itrb_exemption_status_code = 'NO' WHERE has_itrb = 'false';

ALTER TABLE mine_tailings_storage_facility DROP COLUMN IF EXISTS has_itrb;
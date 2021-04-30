CREATE TABLE tsf_operating_status (
    tsf_operating_status_code        varchar                                NOT NULL PRIMARY KEY,
    description                      varchar                                NOT NULL            ,
    active_ind                       boolean                  DEFAULT true  NOT NULL            ,
    create_user                      varchar                                NOT NULL            ,
    display_order					           smallint                               NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL            ,
    update_user                      varchar                                NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE tsf_operating_status OWNER TO mds;

INSERT INTO tsf_operating_status
    (
    tsf_operating_status_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('OPT', 'Operating', 20, 'system-mds', 'system-mds'),
    ('CLO', 'Closed', 10, 'system-mds', 'system-mds'),
    ('CAM', 'Inactive (C&M)', 30, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

ALTER TABLE mine_tailings_storage_facility ADD COLUMN tsf_operating_status_code varchar REFERENCES tsf_operating_status(tsf_operating_status_code);
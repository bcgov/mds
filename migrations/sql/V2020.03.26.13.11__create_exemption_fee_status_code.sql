CREATE TABLE exemption_fee_status (
    exemption_fee_status_code        varchar                                NOT NULL PRIMARY KEY,
    description                      varchar                                NOT NULL            ,
    active_ind                       boolean                  DEFAULT true  NOT NULL            ,
    create_user                      varchar                                NOT NULL            ,
    display_order					 smallint                               NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL            ,
    update_user                      varchar                                NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE exemption_fee_status OWNER TO mds;

INSERT INTO exemption_fee_status
    (
    exemption_fee_status_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('Y', 'Yes', 10, 'system-mds', 'system-mds'),
    ('F', 'Ministry of Forests', 20, 'system-mds', 'system-mds'),
    ('H', 'Ministry of Highways', 30, 'system-mds', 'system-mds'),
    ('M', 'Municipality', 40, 'system-mds', 'system-mds'),
    ('O', 'OGC', 50, 'system-mds', 'system-mds'),
    ('P', 'Placer Surface', 60, 'system-mds', 'system-mds'),
    ('R', 'Reclaimed', 70, 'system-mds', 'system-mds'),
    ('X', 'Mineral Exploration Surface', 80, 'system-mds', 'system-mds'),
    ('A', 'Aboriginal', 90, 'system-mds', 'system-mds'),
    ('B', 'Abandoned', 100, 'system-mds', 'system-mds'),
    ('N', 'Not Permitted', 110, 'system-mds', 'system-mds'),
    ('I', 'Investigative Use S&G', 120, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

ALTER TABLE mine ADD COLUMN exemption_fee_status_code varchar REFERENCES exemption_fee_status(exemption_fee_status_code);
ALTER TABLE mine ADD COLUMN exemption_fee_status_note varchar;
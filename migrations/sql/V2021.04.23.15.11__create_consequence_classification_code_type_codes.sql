CREATE TABLE consequence_classification_status (
    consequence_classification_status_code        varchar                                NOT NULL PRIMARY KEY,
    description                      varchar                                NOT NULL            ,
    active_ind                       boolean                  DEFAULT true  NOT NULL            ,
    create_user                      varchar                                NOT NULL            ,
    display_order					           smallint                               NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL            ,
    update_user                      varchar                                NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE consequence_classification_status OWNER TO mds;

INSERT INTO consequence_classification_status
    (
    consequence_classification_status_code,
    description,
    display_order,
    create_user,
    update_user
    )
VALUES
    ('LOW', 'Low', 10, 'system-mds', 'system-mds'),
    ('SIG', 'Significant', 20, 'system-mds', 'system-mds'),
    ('HIG', 'High', 30, 'system-mds', 'system-mds'),
    ('EXT', 'Extreme', 40, 'system-mds', 'system-mds'),
    ('NOD', 'N/A (No Dam)', 50, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

ALTER TABLE mine_tailings_storage_facility ADD COLUMN consequence_classification_status_code varchar REFERENCES consequence_classification_status(consequence_classification_status_code);
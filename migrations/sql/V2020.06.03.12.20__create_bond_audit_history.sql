CREATE TABLE IF NOT EXISTS bond_history (
    bond_history_id                                                  SERIAL PRIMARY KEY,
    bond_id                          integer                                   NOT NULL,
    amount                           numeric(14,2)                                     ,
    bond_type_code                   varchar                                   NOT NULL,
    permit_guid                      uuid                                      NOT NULL,
    permit_no                        varchar                                   NOT NULL,
    payer_party_guid                 uuid                                      NOT NULL,
    payer_name                       varchar                                   NOT NULL,
    bond_status_code                 varchar                                   NOT NULL,
    reference_number                 varchar                                           ,
    update_user                      varchar                                   NOT NULL,
    update_timestamp                 timestamp with time zone DEFAULT now()    NOT NULL,
    institution_name                 varchar,
    institution_street               varchar,
    institution_city                 varchar,
    institution_province             varchar,
    institution_postal_code          varchar,
    note                             varchar,
    issue_date                       timestamp,
    project_id                       varchar,

    FOREIGN KEY (bond_id) REFERENCES bond(bond_id) DEFERRABLE INITIALLY DEFERRED

);

ALTER TABLE bond_history OWNER TO mds;

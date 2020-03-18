CREATE TABLE bond_status (
    bond_status_code                 varchar                                NOT NULL PRIMARY KEY,
    description                      varchar                                NOT NULL            ,
    active_ind                       boolean                  DEFAULT true  NOT NULL            ,
    create_user                      varchar                                NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL            ,
    update_user                      varchar                                NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE bond_status OWNER TO mds;

CREATE TABLE bond_type(
    bond_type_code                   varchar                                NOT NULL PRIMARY KEY,
    description                      varchar                                NOT NULL            ,
    active_ind                       boolean                  DEFAULT true  NOT NULL            ,
    create_user                      varchar                                NOT NULL            ,
    create_timestamp                 timestamp with time zone DEFAULT now() NOT NULL            ,
    update_user                      varchar                                NOT NULL            ,
    update_timestamp                 timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE bond_type OWNER TO mds;

CREATE TABLE IF NOT EXISTS bond (
    bond_id                                                          SERIAL PRIMARY KEY,
    bond_guid                        uuid DEFAULT gen_random_uuid()     UNIQUE NOT NULL,
    amount                           numeric(14,2)                             NOT NULL,
    bond_type_code                   varchar                                   NOT NULL,
    payer_party_guid                 uuid                                      NOT NULL,
    institution_name                 varchar                                           ,
    institution_street               varchar                                           ,
    institution_city                 varchar                                           ,
    institution_province             varchar                                           ,
    institution_postal_code          varchar                                           ,
    note                             varchar                                           ,
    issue_date                       timestamp                                 NOT NULL,
    bond_status_code                 varchar                                   NOT NULL,
    reference_number                 varchar                                           ,
    create_user                      varchar                                   NOT NULL,
    create_timestamp                 timestamp with time zone DEFAULT now()    NOT NULL,
    update_user                      varchar                                   NOT NULL,
    update_timestamp                 timestamp with time zone DEFAULT now()    NOT NULL,

    FOREIGN KEY (payer_party_guid) REFERENCES party(party_guid) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (bond_status_code) REFERENCES bond_status(bond_status_code) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (bond_type_code) REFERENCES bond_type(bond_type_code) DEFERRABLE INITIALLY DEFERRED

);

ALTER TABLE bond OWNER TO mds;

CREATE TABLE IF NOT EXISTS bond_permit_xref
(
    bond_id               integer                           NOT NULL,
    permit_id             integer                           NOT NULL,

    FOREIGN KEY (bond_id) REFERENCES bond(bond_id) DEFERRABLE INITIALLY DEFERRED,
    FOREIGN KEY (permit_id) REFERENCES permit(permit_id) DEFERRABLE INITIALLY DEFERRED,
    PRIMARY KEY(bond_id, permit_id)
);

ALTER TABLE bond_permit_xref OWNER TO mds;
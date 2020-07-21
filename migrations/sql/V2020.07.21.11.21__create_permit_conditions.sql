CREATE TABLE IF NOT EXISTS permit_condition_category
(
    condition_category_code             varchar                               PRIMARY KEY,
    description                         varchar                                  NOT NULL,
    active_ind                          boolean                     DEFAULT true NOT NULL,
    display_order                       integer                                  NOT NULL,

    create_user                         character varying(60)                    NOT NULL,
    create_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                         character varying(60)                    NOT NULL,
    update_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL,
);

ALTER TABLE permit_condition_category OWNER TO mds;

COMMENT ON TABLE party_orgbook_entity IS '';

CREATE TABLE IF NOT EXISTS permit_conditions
(
    permit_condition_id                                                SERIAL PRIMARY KEY,
    permit_amendment_id                 integer                           UNIQUE NOT NULL,
    permit_condition_guid               uuid                              UNIQUE NOT NULL,
    condition                           varchar                                  NOT NULL,
    condition_category                  varchar                                  NOT NULL,
    deleted_ind                         boolean                    DEFAULT false NOT NULL,
    parent_condition_id                 integer                                          ,
    display_order                       integer                                  NOT NULL,

    create_user                         character varying(60)                    NOT NULL,
    create_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                         character varying(60)                    NOT NULL,
    update_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL,

    FOREIGN KEY (permit_amendment_id) REFERENCES permit_amendment(permit_amendment_id),
    FOREIGN KEY (parent_condition_id) REFERENCES permit_conditions(permit_condition_id),
    FOREIGN KEY (condition_category) REFERENCES permit_condition_category(condition_category_code)
);

ALTER TABLE permit_conditions OWNER TO mds;

COMMENT ON TABLE permit_conditions IS 'Contains the set of conditions for a draft permit.';

CREATE TABLE IF NOT EXISTS standard_permit_conditions
(
    standard_permit_condition_id                                       SERIAL PRIMARY KEY,
    standard_permit_condition_guid      uuid                              UNIQUE NOT NULL,
    condition                           varchar                                  NOT NULL,
    condition_category                  varchar                                  NOT NULL,
    deleted_ind                         boolean                    DEFAULT false NOT NULL,
    display_order                       integer                                  NOT NULL,

    create_user                         character varying(60)                    NOT NULL,
    create_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                         character varying(60)                    NOT NULL,
    update_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL,

    FOREIGN KEY (condition_category) REFERENCES permit_condition_category(condition_category_code)
);

ALTER TABLE standard_permit_conditions OWNER TO mds;

COMMENT ON TABLE standard_permit_conditions IS 'Contains the set of standard conditions for every permit.';
CREATE TABLE IF NOT EXISTS permit_condition_category
(
    condition_category_code             varchar                               PRIMARY KEY,
    description                         varchar                                  NOT NULL,
    active_ind                          boolean                     DEFAULT true NOT NULL,
    display_order                       integer                                  NOT NULL,

    create_user                         character varying(60)                    NOT NULL,
    create_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                         character varying(60)                    NOT NULL,
    update_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL
);

ALTER TABLE permit_condition_category OWNER TO mds;

COMMENT ON TABLE permit_condition_category IS 'The category of the permit condition.';

CREATE TABLE IF NOT EXISTS permit_condition_type
(
    condition_type_code                 varchar                               PRIMARY KEY,
    description                         varchar                                  NOT NULL,
    active_ind                          boolean                     DEFAULT true NOT NULL,
    display_order                       integer                                  NOT NULL,

    create_user                         character varying(60)                    NOT NULL,
    create_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                         character varying(60)                    NOT NULL,
    update_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL
);

ALTER TABLE permit_condition_type OWNER TO mds;

COMMENT ON TABLE permit_condition_type IS 'The type of condition on a permit one of: condition, sub condition or list.';

CREATE TABLE IF NOT EXISTS permit_conditions
(
    permit_condition_id                                                SERIAL PRIMARY KEY,
    permit_amendment_id                 integer                                  NOT NULL,
    permit_condition_guid               uuid           DEFAULT gen_random_uuid() NOT NULL,
    condition                           varchar                                  NOT NULL,
    condition_category                  varchar                                  NOT NULL,
    condition_type                      varchar                                  NOT NULL,
    deleted_ind                         boolean                    DEFAULT false NOT NULL,
    parent_condition_id                 integer                                          ,
    display_order                       integer                                  NOT NULL,

    create_user                         character varying(60)                    NOT NULL,
    create_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                         character varying(60)                    NOT NULL,
    update_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL,

    FOREIGN KEY (permit_amendment_id) REFERENCES permit_amendment(permit_amendment_id),
    FOREIGN KEY (parent_condition_id) REFERENCES permit_conditions(permit_condition_id),
    FOREIGN KEY (condition_category) REFERENCES permit_condition_category(condition_category_code),
    FOREIGN KEY (condition_type) REFERENCES permit_condition_type(condition_type_code)
);

ALTER TABLE permit_conditions OWNER TO mds;

COMMENT ON TABLE permit_conditions IS 'Contains the set of conditions for a draft permit.';

CREATE TABLE IF NOT EXISTS standard_permit_conditions
(
    standard_permit_condition_id                                       SERIAL PRIMARY KEY,
    standard_permit_condition_guid      uuid           DEFAULT gen_random_uuid() NOT NULL,
    permit_type                         varchar                                  NOT NULL,
    condition                           varchar                                  NOT NULL,
    condition_category                  varchar                                  NOT NULL,
    deleted_ind                         boolean                    DEFAULT false NOT NULL,
    display_order                       integer                                  NOT NULL,

    create_user                         character varying(60)                    NOT NULL,
    create_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL,
    update_user                         character varying(60)                    NOT NULL,
    update_timestamp                    timestamp with time zone DEFAULT now()   NOT NULL,

    FOREIGN KEY (condition_category) REFERENCES permit_condition_category(condition_category_code),
    FOREIGN KEY (permit_type) REFERENCES notice_of_work_type(notice_of_work_type_code)
);

ALTER TABLE standard_permit_conditions OWNER TO mds;

COMMENT ON TABLE standard_permit_conditions IS 'Contains the set of standard conditions for every permit.';

INSERT INTO permit_condition_category
(condition_category_code, description, active_ind, display_order, create_user, update_user)
VALUES
	('GEC', 'General Conditions', true, 10, 'system-mds', 'system-mds'),
	('HSC', 'Health and Safety Conditions', true, 20, 'system-mds', 'system-mds'),
	('GOC', 'Geotechnical Conditions', true, 30, 'system-mds', 'system-mds'),
	('ELC', 'Environmental Land and Watercourses Conditions', true, 40, 'system-mds', 'system-mds'),
    ('RCC', 'Reclamation and Closure Program Conditions', true, 50, 'system-mds', 'system-mds'),
	('ADC', 'Additional Conditions', true, 60, 'system-mds', 'system-mds')
on conflict do nothing;

INSERT INTO permit_condition_type
(condition_type_code, description, active_ind, display_order, create_user, update_user)
VALUES
	('SEC', 'Permit Section', true, 10, 'system-mds', 'system-mds'),
	('CON', 'Condition', true, 20, 'system-mds', 'system-mds'),
	('LIS', 'List Item', true, 30, 'system-mds', 'system-mds')
on conflict do nothing;
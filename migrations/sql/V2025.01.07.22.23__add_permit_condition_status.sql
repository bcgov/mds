

CREATE TABLE IF NOT EXISTS permit_condition_status_code
    (
        permit_condition_status_code character varying(3) NOT NULL,
        description character varying(100) NOT NULL,
        display_order smallint,
        active_ind boolean DEFAULT true NOT null,
        create_user character varying(60) NOT NULL,
        create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
        update_user character varying(60) NOT NULL,
        update_timestamp timestamp with time zone DEFAULT now() NOT NULL
    );

    ALTER TABLE permit_condition_status_code OWNER TO mds;
    ALTER TABLE permit_condition_status_code
    ADD CONSTRAINT permit_condition_status_code_pkey PRIMARY KEY
    (permit_condition_status_code);

    INSERT INTO permit_condition_status_code
        (
        permit_condition_status_code,
        description,
        display_order,
        create_user,
        update_user
        )
    VALUES
        ('NST', 'Not Started', 10, 'system-mds', 'system-mds'),
        ('INP', 'In Progress', 20, 'system-mds', 'system-mds'),
        ('COM', 'Complete', 30, 'system-mds', 'system-mds')
    ON CONFLICT DO NOTHING;

ALTER TABLE permit_conditions
    ADD COLUMN IF NOT EXISTS permit_condition_status_code character varying(3) DEFAULT 'NST' NOT NULL,
    ADD COLUMN IF NOT EXISTS top_level_parent_permit_condition_id integer,
ADD CONSTRAINT permit_condition_status_code_fkey FOREIGN KEY (permit_condition_status_code)
    REFERENCES permit_condition_status_code(permit_condition_status_code),
ADD CONSTRAINT top_level_parent_permit_condition_id_fkey FOREIGN KEY (top_level_parent_permit_condition_id)
    REFERENCES permit_conditions(permit_condition_id);

ALTER TABLE permit_conditions_version 
    ADD COLUMN IF NOT EXISTS permit_condition_status_code character varying(3) DEFAULT 'NST' NOT NULL,
    ADD COLUMN IF NOT EXISTS top_level_parent_permit_condition_id integer,
ADD CONSTRAINT permit_condition_status_code_fkey FOREIGN KEY (permit_condition_status_code)
    REFERENCES permit_condition_status_code(permit_condition_status_code),
ADD CONSTRAINT top_level_parent_permit_condition_id_fkey FOREIGN KEY (top_level_parent_permit_condition_id)
    REFERENCES permit_conditions(permit_condition_id);

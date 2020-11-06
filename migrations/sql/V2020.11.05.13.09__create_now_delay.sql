
    CREATE TABLE IF NOT EXISTS now_application_delay_type ( 
        delay_type_code varchar,
        description varchar,
        display_order integer,
        active_ind boolean NOT NULL default 'True',
        create_user character varying NOT NULL,
        create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
        update_user character varying NOT NULL,
        update_timestamp timestamp with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS now_application_delay (
        now_application_delay_id SERIAL primary key, 
        now_application_guid uuid, 
        delay_type_code varchar,
        delay_comment varchar,
        delay_start_date date,
        delay_end_date date, 
        create_user character varying NOT NULL,
        create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
        update_user character varying NOT NULL,
        update_timestamp timestamp with time zone DEFAULT now() NOT NULL,

        FOREIGN KEY (now_application_guid) REFERENCES now_application_identity(now_application_guid),
        FOREIGN KEY (delay_type_code) REFERENCES now_application_delay_type(delay_type_code)
    );

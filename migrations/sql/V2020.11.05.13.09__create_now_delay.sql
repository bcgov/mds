
    CREATE TABLE IF NOT EXISTS now_application_delay_type ( 
        delay_type_code varchar PRIMARY KEY,
        description varchar NOT NULL,
        display_order integer,
        active_ind boolean NOT NULL default 'True',
        create_user character varying NOT NULL,
        create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
        update_user character varying NOT NULL,
        update_timestamp timestamp with time zone DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS now_application_delay (
        now_application_delay_id SERIAL primary key, 
        now_application_delay_guid   uuid DEFAULT gen_random_uuid()   UNIQUE NOT NULL ,
        now_application_guid uuid NOT NULL, 
        delay_type_code varchar NOT NULL,
        start_comment varchar NOT NULL,
        start_date timestamp with time zone NOT NULL,
        end_comment varchar,
        end_date timestamp with time zone, 
        create_user character varying NOT NULL,
        create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
        update_user character varying NOT NULL,
        update_timestamp timestamp with time zone DEFAULT now() NOT NULL,

        FOREIGN KEY (now_application_guid) REFERENCES now_application_identity(now_application_guid),
        FOREIGN KEY (delay_type_code) REFERENCES now_application_delay_type(delay_type_code)
    );

    ALTER TABLE now_application_progress ADD COLUMN end_date timestamp with time zone;
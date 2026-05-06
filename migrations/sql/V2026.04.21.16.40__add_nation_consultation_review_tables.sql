CREATE TABLE IF NOT EXISTS now_application_nation_status (
    now_application_nation_status_code varchar(3) NOT NULL PRIMARY KEY,
    description varchar(100) NOT NULL,
    active_ind boolean DEFAULT TRUE NOT NULL,
    create_user varchar(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user varchar(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    display_order smallint
);

CREATE TABLE IF NOT EXISTS now_application_nation_event_code (
    now_application_nation_event_code varchar(3) NOT NULL PRIMARY KEY,
    description varchar(100) NOT NULL,
    active_ind boolean DEFAULT TRUE NOT NULL,
    create_user varchar(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user varchar(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    display_order smallint
);

INSERT INTO now_application_nation_status
    (
    now_application_nation_status_code,
    description,
    active_ind,
    create_user,
    update_user,
    display_order
    )
VALUES
    ('NOS', 'Not Started', true, 'system-mds', 'system-mds', 10),
    ('IPG', 'In Progress', true, 'system-mds', 'system-mds', 20),
    ('OHD', 'On Hold', true, 'system-mds', 'system-mds', 30),
    ('IRV', 'In Review', true, 'system-mds', 'system-mds', 40),
    ('COM', 'Complete', true, 'system-mds', 'system-mds', 50)
ON CONFLICT DO NOTHING;

INSERT INTO now_application_nation_event_code
    (
    now_application_nation_event_code,
    description,
    active_ind,
    create_user,
    update_user,
    display_order
    )
VALUES
    ('SCN', 'Start consultation', true, 'system-mds', 'system-mds', 10),
    ('ICS', 'Initial consultation sent', true, 'system-mds', 'system-mds', 20),
    ('INS', 'Information sent', true, 'system-mds', 'system-mds', 30),
    ('INR', 'Information received', true, 'system-mds', 'system-mds', 40),
    ('MPR', 'Materials provided for review', true, 'system-mds', 'system-mds', 50),
    ('DMR', 'Decision-maker review', true, 'system-mds', 'system-mds', 60),
    ('PSP', 'Process pause', true, 'system-mds', 'system-mds', 70)
ON CONFLICT DO NOTHING;


CREATE TABLE IF NOT EXISTS now_application_nation (
    now_application_nation_guid uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    now_application_nation_id serial UNIQUE NOT NULL,
    now_application_guid uuid NOT NULL,
    now_application_nation_status_code varchar(3) NOT NULL,
    consultation_started_by_client boolean DEFAULT FALSE,
    due_date DATE,
    contact_organization_name varchar NOT NULL,
    organization_guid text NOT NULL,
    consultation_area_name varchar NOT NULL,
    consultation_area_guid text NOT NULL,
    consultation_area_update_date timestamp without time zone NOT NULL,
    create_user varchar(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user varchar(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    deleted_ind boolean DEFAULT FALSE NOT NULL,

    CONSTRAINT fk_now_application_nation_now_application_guid FOREIGN KEY (now_application_guid) REFERENCES now_application_identity(now_application_guid),
    CONSTRAINT fk_now_application_nation_status_code FOREIGN KEY (now_application_nation_status_code) REFERENCES now_application_nation_status(now_application_nation_status_code)
);

CREATE INDEX IF NOT EXISTS idx_now_application_nation_now_application_guid ON now_application_nation(now_application_guid);
CREATE INDEX IF NOT EXISTS idx_now_application_nation_status_code ON now_application_nation(now_application_nation_status_code);


CREATE TABLE IF NOT EXISTS now_application_nation_event (
    now_application_nation_event_guid uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    now_application_nation_event_id serial UNIQUE NOT NULL,
    now_application_nation_guid uuid NOT NULL,
    now_application_nation_event_code varchar(3) NOT NULL,
    event_from varchar NOT NULL,
    event_to varchar NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    create_user varchar(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user varchar(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    deleted_ind boolean DEFAULT FALSE NOT NULL,

    CONSTRAINT fk_now_application_nation_event_now_application_nation_guid FOREIGN KEY (now_application_nation_guid) REFERENCES now_application_nation(now_application_nation_guid),
    CONSTRAINT fk_now_application_nation_event_code FOREIGN KEY (now_application_nation_event_code) REFERENCES now_application_nation_event_code(now_application_nation_event_code)
);

CREATE INDEX IF NOT EXISTS idx_now_application_nation_event_nation_guid ON now_application_nation_event(now_application_nation_guid);
CREATE INDEX IF NOT EXISTS idx_now_application_nation_event_code ON now_application_nation_event(now_application_nation_event_code);
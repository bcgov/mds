CREATE TABLE IF NOT EXISTS notice_of_work_tier (
    notice_of_work_tier_code varchar(3) PRIMARY KEY,
    description varchar(50) NOT NULL,
    display_order integer NOT NULL,
    active_ind boolean DEFAULT true NOT NULL,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL
);

COMMENT ON TABLE notice_of_work_tier IS 'Lookup table for Notice of Work Tier Categories (e.g., Tier 1, Tier 2, Tier 3).';

INSERT INTO notice_of_work_tier
    (notice_of_work_tier_code, description, display_order, active_ind, create_user, update_user)
VALUES
    ('T1', 'Tier 1', 10, true, 'system-mds', 'system-mds'),
    ('T2', 'Tier 2', 20, true, 'system-mds', 'system-mds'),
    ('T3', 'Tier 3', 30, true, 'system-mds', 'system-mds')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS now_application_tier (
    now_application_tier_id serial PRIMARY KEY,
    now_application_id integer NOT NULL UNIQUE,
    notice_of_work_tier_code varchar(3) NOT NULL,
    description text,
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,

    FOREIGN KEY (now_application_id) REFERENCES now_application(now_application_id) ON DELETE CASCADE,
    FOREIGN KEY (notice_of_work_tier_code) REFERENCES notice_of_work_tier(notice_of_work_tier_code)
);

CREATE INDEX IF NOT EXISTS idx_now_application_tier_now_application_id ON now_application_tier(now_application_id);
CREATE INDEX IF NOT EXISTS idx_now_application_tier_code ON now_application_tier(notice_of_work_tier_code);

COMMENT ON TABLE now_application_tier IS 'Tracks the assigned Tier Category and rationale for a Notice of Work application.';

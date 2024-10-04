CREATE TABLE IF NOT EXISTS help (
    help_guid           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    help_key            VARCHAR(30) NOT NULL,
    help_key_params     JSONB,
    content             VARCHAR,
    is_draft            BOOLEAN DEFAULT false,
    create_user         VARCHAR(60) NOT NULL,
    create_timestamp    timestamp with time zone DEFAULT now() NOT NULL,
    update_user         VARCHAR(60) NOT NULL,
    update_timestamp    timestamp with time zone DEFAULT now() NOT NULL
);
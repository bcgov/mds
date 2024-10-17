CREATE TABLE IF NOT EXISTS help (
    help_guid           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    help_key            VARCHAR(30) NOT NULL,
    system              VARCHAR(9) NOT NULL,
    page_tab            VARCHAR(50) DEFAULT 'all_tabs',
    content             VARCHAR,
    is_draft            BOOLEAN DEFAULT false,
    create_user         VARCHAR(60) NOT NULL,
    create_timestamp    timestamp with time zone DEFAULT now() NOT NULL,
    update_user         VARCHAR(60) NOT NULL,
    update_timestamp    timestamp with time zone DEFAULT now() NOT NULL
);

INSERT INTO help (
help_key, system, page_tab, content, is_draft, create_user, update_user
) VALUES (
'default', 'CORE', 'all_tabs', '<p>Check back soon for updates. Thank you for your patience.</p>', false, 'system', 'system'
);

INSERT INTO help (
help_key, system, page_tab, content, is_draft, create_user, update_user
) VALUES (
'default', 'MineSpace', 'all_tabs', '<p>Check back soon for updates. Thank you for your patience.</p>', false, 'system', 'system'
);
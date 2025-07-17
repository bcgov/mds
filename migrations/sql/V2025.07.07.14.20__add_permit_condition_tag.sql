CREATE TABLE IF NOT EXISTS permit_condition_tag (
    permit_condition_tag_guid   uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    description         VARCHAR(255) NOT NULL,
    create_user         VARCHAR(60) NOT NULL,
    create_timestamp    timestamp with time zone DEFAULT now() NOT NULL,
    update_user         VARCHAR(60) NOT NULL,
    update_timestamp    timestamp with time zone DEFAULT now() NOT NULL,
    deleted_ind         BOOLEAN DEFAULT false
);

INSERT INTO permit_condition_tag (description, create_user, update_user)
VALUES
    ('Traditional knowledge', 'system', 'system'),
    ('Measurable', 'system', 'system'),
    ('Specific', 'system', 'system'),
    ('Growth medium', 'system', 'system'),
    ('Revegetation', 'system', 'system'),
    ('Securities', 'system', 'system'),
    ('Mine roads', 'system', 'system'),
    ('Timber', 'system', 'system');

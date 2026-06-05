-- Create distribution_list table
CREATE TABLE distribution_list (
    distribution_list_guid uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    distribution_list_name character varying(100) NOT NULL UNIQUE,
    description character varying(255),
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    deleted_ind boolean DEFAULT false NOT NULL
);

-- Create distribution_list_user table
CREATE TABLE distribution_list_user (
    distribution_list_user_guid uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    distribution_list_guid uuid NOT NULL REFERENCES distribution_list(distribution_list_guid),
    emli_contact_guid uuid NOT NULL REFERENCES emli_contact(contact_guid),
    create_user character varying(60) NOT NULL,
    create_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    update_user character varying(60) NOT NULL,
    update_timestamp timestamp with time zone DEFAULT now() NOT NULL,
    deleted_ind boolean DEFAULT false NOT NULL
);

-- Add distribution_list_guid to email_tracking
ALTER TABLE email_tracking ADD COLUMN distribution_list_guid uuid REFERENCES distribution_list(distribution_list_guid);

-- Seed distribution lists
INSERT INTO distribution_list (distribution_list_name, description, create_user, update_user)
VALUES
    ('Notice of Departure', 'Notification group for Notice of Departure submissions', 'system', 'system'),
    ('TSFs', 'Notification group for Tailings Storage Facility updates', 'system', 'system'),
    ('Major Projects', 'Notification group for Major Projects', 'system', 'system'),
    ('Variances', 'Notification group for Variances applications', 'system', 'system'),
    ('Notice to Start/Stop Work', 'Notification group for Notice to Start/Stop Work', 'system', 'system'),
    ('Incidents', 'Notification group for Incidents', 'system', 'system'),
    ('Report Submission - Major Mines', 'Notification group for Report Submissions (Major Mines)', 'system', 'system'),
    ('Report Submission - Regional Mines', 'Notification group for Report Submissions (Regional Mines)', 'system', 'system');

-- Add GEN to emli_contact_type
INSERT INTO emli_contact_type (emli_contact_type_code, description, display_order, create_user, update_user)
VALUES ('GEN', 'General Contact', 100, 'system', 'system')
ON CONFLICT DO NOTHING;

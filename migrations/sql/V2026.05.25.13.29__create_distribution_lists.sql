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

-- Function to safely insert emli_contact and distribution_list_user
CREATE OR REPLACE FUNCTION pg_temp.seed_distribution_user(
    p_email VARCHAR, 
    p_first_name VARCHAR, 
    p_last_name VARCHAR,
    p_distribution_list_name VARCHAR
) RETURNS void AS $$
DECLARE
    v_contact_guid uuid;
    v_list_guid uuid;
BEGIN
    -- Check if contact exists
    SELECT contact_guid INTO v_contact_guid FROM emli_contact WHERE email = p_email AND deleted_ind = false LIMIT 1;
    
    -- If not, insert it (using a generic type if necessary, or assuming null is ok if foreign keys allow. 
    -- Actually, emli_contact requires emli_contact_type_code. Let's use 'GEN' (General) or whatever is available.
    IF v_contact_guid IS NULL THEN
        -- Check if 'GEN' type exists, if not maybe 'MMG' or similar. 
        -- Based on codebase, 'GEN' is a valid type.
        INSERT INTO emli_contact (contact_guid, emli_contact_type_code, email, first_name, last_name, is_general_contact, create_user, update_user)
        VALUES (gen_random_uuid(), 'GEN', p_email, p_first_name, p_last_name, true, 'system', 'system')
        RETURNING contact_guid INTO v_contact_guid;
    END IF;

    -- Get distribution list guid
    SELECT distribution_list_guid INTO v_list_guid FROM distribution_list WHERE distribution_list_name = p_distribution_list_name LIMIT 1;

    -- Insert into distribution_list_user
    IF v_list_guid IS NOT NULL AND v_contact_guid IS NOT NULL THEN
        INSERT INTO distribution_list_user (distribution_list_guid, emli_contact_guid, create_user, update_user)
        VALUES (v_list_guid, v_contact_guid, 'system', 'system');
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Seed Notice of Departure recipients (MAJOR_MINES_NOD_NOTFICATION_EMAILS)
SELECT pg_temp.seed_distribution_user('mds@gov.bc.ca', 'MDS', 'Inbox', 'Notice of Departure');
SELECT pg_temp.seed_distribution_user('sean.shaw@gov.bc.ca', 'Sean', 'Shaw', 'Notice of Departure');
SELECT pg_temp.seed_distribution_user('Magda.Kingsley@gov.bc.ca', 'Magda', 'Kingsley', 'Notice of Departure');
SELECT pg_temp.seed_distribution_user('Kelsey.Norlund@gov.bc.ca', 'Kelsey', 'Norlund', 'Notice of Departure');
SELECT pg_temp.seed_distribution_user('Kristy.Emery@gov.bc.ca', 'Kristy', 'Emery', 'Notice of Departure');
SELECT pg_temp.seed_distribution_user('Samuel.Barnes@gov.bc.ca', 'Samuel', 'Barnes', 'Notice of Departure');
SELECT pg_temp.seed_distribution_user('Brent.Timmons@gov.bc.ca', 'Brent', 'Timmons', 'Notice of Departure');

-- Seed TSFs recipients (MINESPACE_TSF_UPDATE_EMAIL)
SELECT pg_temp.seed_distribution_user('permrecl@gov.bc.ca', 'Permit', 'Reclamation', 'TSFs');
SELECT pg_temp.seed_distribution_user('mark.smith@gov.bc.ca', 'Mark', 'Smith', 'TSFs');
SELECT pg_temp.seed_distribution_user('victor.marques@gov.bc.ca', 'Victor', 'Marques', 'TSFs');
SELECT pg_temp.seed_distribution_user('mds@gov.bc.ca', 'MDS', 'Inbox', 'TSFs');

-- Seed Major Projects recipients (PROJECT_SUMMARY_EMAILS)
SELECT pg_temp.seed_distribution_user('mds@gov.bc.ca', 'MDS', 'Inbox', 'Major Projects');
SELECT pg_temp.seed_distribution_user('Magda.Kingsley@gov.bc.ca', 'Magda', 'Kingsley', 'Major Projects');
SELECT pg_temp.seed_distribution_user('Kelsey.Norlund@gov.bc.ca', 'Kelsey', 'Norlund', 'Major Projects');
SELECT pg_temp.seed_distribution_user('Kristy.Emery@gov.bc.ca', 'Kristy', 'Emery', 'Major Projects');
SELECT pg_temp.seed_distribution_user('Samuel.Barnes@gov.bc.ca', 'Samuel', 'Barnes', 'Major Projects');

-- Seed Variances recipients (VARIANCE_APPLICATION_EMAIL)
SELECT pg_temp.seed_distribution_user('hermanus.henning@gov.bc.ca', 'Hermanus', 'Henning', 'Variances');

-- Seed Incidents recipients (INCIDENTS_EMAIL)
SELECT pg_temp.seed_distribution_user('mineincidents@gov.bc.ca', 'Mine', 'Incidents', 'Incidents');

-- Seed Report Submission (Major Mines)
SELECT pg_temp.seed_distribution_user('mds@gov.bc.ca', 'MDS', 'Inbox', 'Report Submission - Major Mines');

-- Seed Report Submission (Regional Mines)
SELECT pg_temp.seed_distribution_user('mds@gov.bc.ca', 'MDS', 'Inbox', 'Report Submission - Regional Mines');

-- We leave out Notice to Start/Stop Work for now unless it was explicitly defined in constants, 
-- but it will be empty initially for admins to add.

DROP FUNCTION pg_temp.seed_distribution_user(VARCHAR, VARCHAR, VARCHAR, VARCHAR);

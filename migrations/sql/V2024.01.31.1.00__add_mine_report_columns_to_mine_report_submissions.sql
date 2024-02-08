-- add the columns from mine report that are not on mine report submission
ALTER TABLE mine_report_submission
    ADD COLUMN IF NOT EXISTS mine_report_definition_id integer,
    ADD COLUMN IF NOT EXISTS mine_guid uuid,
    ADD COLUMN IF NOT EXISTS permit_id integer,
    ADD COLUMN IF NOT EXISTS due_date timestamp,
    ADD COLUMN IF NOT EXISTS received_date timestamp default now(),
    ADD COLUMN IF NOT EXISTS submission_year smallint,
    ADD COLUMN IF NOT EXISTS deleted_ind boolean default False NOT NULL,
    -- ADD COLUMN IF NOT EXISTS created_by_idir varchar, // specifically excluding this one
    ADD COLUMN IF NOT EXISTS permit_condition_category_code varchar(3),
    ADD COLUMN IF NOT EXISTS description_comment varchar,
    ADD COLUMN IF NOT EXISTS submitter_name varchar(255),
    ADD COLUMN IF NOT EXISTS submitter_email varchar(255);

-- bring over data from parent mine report into mine report submission
UPDATE mine_report_submission
	SET
    mine_report_definition_id = mine_report.mine_report_definition_id,
    mine_guid = mine_report.mine_guid,
    permit_id = mine_report.permit_id,
    due_date = mine_report.due_date,
    received_date = mine_report.received_date,
    deleted_ind = mine_report.deleted_ind,
    permit_condition_category_code = mine_report.permit_condition_category_code,
    description_comment = mine_report.description_comment,
    submission_year = mine_report.submission_year,
    submitter_name = mine_report.submitter_name,
    submitter_email = mine_report.submitter_email
	FROM mine_report
		WHERE mine_report_submission.mine_report_id = mine_report.mine_report_id;

-- add column constraints
ALTER TABLE mine_report_submission
    -- not null constraints
    ALTER COLUMN mine_guid SET NOT NULL,

    -- foreign key constraints
    ADD CONSTRAINT mine_report_submission_mine_report_definition_fkey
        FOREIGN KEY (mine_report_definition_id) REFERENCES mine_report_definition(mine_report_definition_id),

    ADD CONSTRAINT mine_report_submission_mine_fkey
        FOREIGN KEY (mine_guid) REFERENCES mine(mine_guid),

    ADD CONSTRAINT mine_report_submission_permit_fkey
        FOREIGN KEY (permit_id) REFERENCES permit(permit_id),

    ADD CONSTRAINT mine_report_submission_permit_condition_category_fkey
        FOREIGN KEY (permit_condition_category_code) REFERENCES permit_condition_category(condition_category_code),

    -- existing check on 2 columns
    ADD CONSTRAINT submission_condition_category_or_report_def_should_be_specified
        CHECK 
        (
            ( CASE WHEN permit_condition_category_code IS NULL THEN 0 ELSE 1 END
            + CASE WHEN mine_report_definition_id IS NULL THEN 0 ELSE 1 END
            ) = 1
        );

-- track contacts by submission
ALTER TABLE mine_report_contact
    ADD COLUMN IF NOT EXISTS mine_report_submission_id integer;

    -- insert an entry for each contact for each submission
    INSERT INTO mine_report_contact (name, email, mine_report_id, deleted_ind, mine_report_submission_id)
    SELECT 
            mine_report_contact.name, 
            mine_report_contact.email, 
            mine_report_contact.mine_report_id, 
            mine_report_contact.deleted_ind, 
            mine_report_submission.mine_report_submission_id
        FROM mine_report_submission
        LEFT JOIN mine_report_contact 
        ON mine_report_submission.mine_report_id = mine_report_contact.mine_report_id 
        WHERE mine_report_contact_id IS NOT NULL;

    -- delete old records
    DELETE FROM mine_report_contact WHERE mine_report_submission_id IS NULL;

    -- add constraints to new column
    ALTER TABLE mine_report_contact
        ALTER COLUMN mine_report_submission_id SET NOT NULL,
        ADD CONSTRAINT mine_report_contact_submission_fkey
            FOREIGN KEY (mine_report_submission_id) REFERENCES mine_report_submission(mine_report_submission_id);
-- Add a new column `mine_report_permit_requirement_id` to the `mine_report_submission` table
ALTER TABLE mine_report_submission
    ADD COLUMN mine_report_permit_requirement_id INTEGER,
    ADD CONSTRAINT fk_mine_report_permit_requirement
        FOREIGN KEY (mine_report_permit_requirement_id)
            REFERENCES mine_report_permit_requirement (mine_report_permit_requirement_id);
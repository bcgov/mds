ALTER TABLE mine_report ADD COLUMN IF NOT EXISTS permit_condition_category_code VARCHAR(3);

ALTER TABLE mine_report ADD CONSTRAINT mine_report_permit_condition_category_code_fk FOREIGN KEY (permit_condition_category_code) REFERENCES permit_condition_category(condition_category_code);

ALTER TABLE mine_report ALTER COLUMN mine_report_definition_id DROP NOT NULL;
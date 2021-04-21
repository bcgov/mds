ALTER TABLE mine_report ADD COLUMN IF NOT EXISTS permit_condition_category_code VARCHAR(3);

ALTER TABLE mine_report ADD CONSTRAINT mine_report_permit_condition_category_code_fk FOREIGN KEY (permit_condition_category_code) REFERENCES permit_condition_category(condition_category_code);

ALTER TABLE mine_report ALTER COLUMN mine_report_definition_id DROP NOT NULL;

ALTER TABLE mine_report
ADD CONSTRAINT condition_category_or_report_definition_should_be_specified
CHECK 
(
    ( CASE WHEN permit_condition_category_code IS NULL THEN 0 ELSE 1 END
    + CASE WHEN mine_report_definition_id IS NULL THEN 0 ELSE 1 END
    ) = 1
);
ALTER TABLE mine_report_definition
    DROP CONSTRAINT mine_report_definition_report_name_unique;

ALTER TABLE mine_report_definition
    DROP CONSTRAINT uq_report_name;
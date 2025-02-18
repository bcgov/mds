ALTER TABLE mine_report_definition
    ADD CONSTRAINT uq_report_name UNIQUE (report_name);
-- Report requirement names for standard/template conditions were only unique globally
-- (report_name), preventing the same report name from being used across different
-- permit condition templates. Scope uniqueness to the template instead, where a
-- template is identified by notice_of_work_type.

ALTER TABLE mine_report_permit_requirement
    ADD COLUMN condition_category_code VARCHAR REFERENCES permit_condition_category(condition_category_code),
    ADD COLUMN notice_of_work_type VARCHAR REFERENCES notice_of_work_type(notice_of_work_type_code);

ALTER TABLE mine_report_permit_requirement_version
    ADD COLUMN condition_category_code VARCHAR,
    ADD COLUMN notice_of_work_type VARCHAR;

-- Backfill existing standard report requirements from one of their linked standard conditions
UPDATE mine_report_permit_requirement mrpr
SET condition_category_code = linked.condition_category_code,
    notice_of_work_type = linked.notice_of_work_type
FROM (
    SELECT DISTINCT ON (xref.mine_report_permit_requirement_id)
        xref.mine_report_permit_requirement_id,
        spc.condition_category_code,
        spc.notice_of_work_type
    FROM mine_report_req_permit_condition_xref xref
    JOIN standard_permit_conditions spc
        ON spc.standard_permit_condition_id = xref.standard_permit_condition_id
    WHERE xref.is_standard = TRUE AND xref.deleted_ind = FALSE
) linked
WHERE mrpr.mine_report_permit_requirement_id = linked.mine_report_permit_requirement_id
    AND mrpr.is_standard = TRUE;

DROP INDEX unique_standard_report_name_idx;

CREATE UNIQUE INDEX unique_standard_report_name_idx
ON mine_report_permit_requirement (report_name, notice_of_work_type)
WHERE is_standard = TRUE AND report_name IS NOT NULL;


CREATE TABLE IF NOT EXISTS mine_permit_report_condition_xref
(
    mine_permit_report_condition_xref_guid UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mine_report_permit_requirement_id INT NOT NULL,
    permit_condition_id INT NOT NULL,
    CONSTRAINT fk_mine_report_permit_requirement_id FOREIGN KEY (mine_report_permit_requirement_id)
        REFERENCES mine_report_permit_requirement (mine_report_permit_requirement_id),
    CONSTRAINT fk_permit_condition_id FOREIGN KEY (permit_condition_id)
        REFERENCES permit_conditions (permit_condition_id)
);

-- create a record in the xref table for each of the records in mine_report_permit_requirement where report_name is not null
DO $$
DECLARE
    record RECORD;
        permit_condition_ids INT[];
BEGIN
    FOR record IN
        SELECT DISTINCT
            mrpr.permit_amendment_id,
            mrpr.report_name
        FROM
            mine_report_permit_requirement mrpr WHERE mrpr.report_name IS NOT NULL
    LOOP
        SELECT ARRAY_AGG(permit_condition_id)
        INTO permit_condition_ids
        FROM mine_report_permit_requirement
        WHERE permit_amendment_id = record.permit_amendment_id AND report_name = record.report_name;

        FOR i IN 1..array_length(permit_condition_ids, 1) LOOP
        INSERT INTO mine_permit_report_condition_xref (mine_report_permit_requirement_id, permit_condition_id)
        VALUES (
            (SELECT mine_report_permit_requirement_id
             FROM mine_report_permit_requirement
             WHERE permit_amendment_id = record.permit_amendment_id
               AND report_name = record.report_name LIMIT 1),
            permit_condition_ids[i]
        );
        END LOOP;
    END LOOP;
END $$;

-- for each of the records in mine_report_permit_requirement where report_name is null, 
-- create a new record in mine_permit_report_condition_xref
INSERT INTO mine_permit_report_condition_xref (mine_report_permit_requirement_id, permit_condition_id)
SELECT mine_report_permit_requirement_id, permit_condition_id
FROM mine_report_permit_requirement
WHERE report_name IS NULL;

-- check that the number of records in mine_report_permit_requirement is the same as the number of records in mine_permit_report_condition_xref
DO $$
DECLARE
    count_mine_report_permit_requirement INT;
    count_mine_permit_report_condition_xref INT;
BEGIN
    SELECT COUNT(*) INTO count_mine_report_permit_requirement FROM mine_report_permit_requirement;
    SELECT COUNT(*) INTO count_mine_permit_report_condition_xref FROM mine_permit_report_condition_xref;

    IF count_mine_report_permit_requirement != count_mine_permit_report_condition_xref THEN
        RAISE EXCEPTION 'Record count mismatch: mine_report_permit_requirement = %, mine_permit_report_condition_xref = %',
            count_mine_report_permit_requirement, count_mine_permit_report_condition_xref;
    END IF;
END $$;

-- remove the extraneous records & column in mine_report_permit_requirement
DELETE FROM mine_report_permit_requirement
WHERE mine_report_permit_requirement_id NOT IN (SELECT mine_report_permit_requirement_id FROM mine_permit_report_condition_xref);

ALTER TABLE mine_report_permit_requirement DROP COLUMN permit_condition_id;

-- add table constraint to keep xref table free of duplicates, excluding rows where report_name is null
ALTER TABLE mine_permit_report_condition_xref
ADD CONSTRAINT unique_report_name_permit_amendment_id
    UNIQUE (report_name, permit_amendment_id)
    WHERE report_name IS NOT NULL;
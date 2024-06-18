ALTER TABLE project_summary
    ADD regional_district_id integer;

ALTER TABLE project_summary
    ADD CONSTRAINT fk_regional_district_id
        FOREIGN KEY (regional_district_id)
            REFERENCES regions(regional_district_id);
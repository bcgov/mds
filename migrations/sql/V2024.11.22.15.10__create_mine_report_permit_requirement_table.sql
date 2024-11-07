-- Create the cim_or_cpo_type ENUM type
CREATE TYPE cim_or_cpo_type AS ENUM ('CIM', 'CPO', 'BOTH');

-- Create the office_destination_type ENUM type
CREATE TYPE office_destination_type AS ENUM ('MMO', 'HS', 'RO', 'MOE');

-- Create the new permit_report_requirement table
CREATE TABLE mine_report_permit_requirement
(
    mine_report_permit_requirement_id SERIAL PRIMARY KEY,
    update_user                       VARCHAR(255)                           NOT NULL,
    update_timestamp                  timestamp with time zone DEFAULT now() NOT NULL,
    due_date_period_months            INTEGER                                NOT NULL,
    create_user                       VARCHAR(255)                           NOT NULL,
    create_timestamp                  timestamp with time zone DEFAULT now() NOT NULL,
    active_ind                        BOOLEAN                  DEFAULT true  NOT NULL,
    cim_or_cpo                        cim_or_cpo_type,
    office_destination                office_destination_type[],
    permit_condition_id               INTEGER                                NOT NULL,
    permit_id                         INTEGER                                NOT NULL,
    CONSTRAINT fk_permit
        FOREIGN KEY (permit_id)
            REFERENCES permit (permit_id),
    CONSTRAINT fk_permit_condition
        FOREIGN KEY (permit_condition_id)
            REFERENCES permit_conditions (permit_condition_id)
);

COMMENT ON TABLE mine_report_permit_requirement IS 'Captures the report requirements laid out in permit conditions which can have permit required reports submitted against';


-- Add a new column `mine_report_permit_requirement_id` to the `mine_report` table
ALTER TABLE mine_report
    ADD COLUMN mine_report_permit_requirement_id INTEGER,
    ADD CONSTRAINT fk_mine_report_permit_requirement
        FOREIGN KEY (mine_report_permit_requirement_id)
            REFERENCES mine_report_permit_requirement (mine_report_permit_requirement_id);
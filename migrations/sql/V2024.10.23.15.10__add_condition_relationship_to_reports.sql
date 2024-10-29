-- Add permit_condition_id column to mine_report
ALTER TABLE mine_report ADD COLUMN permit_condition_id INTEGER;

CREATE TYPE cim_or_cpo_type AS ENUM ('CIM', 'CPO', 'BOTH');
CREATE TYPE office_destination_type AS ENUM ('MMO', 'HS', 'RO', 'MOE');

-- Add cim_or_cpo column to mine_report
ALTER TABLE mine_report ADD COLUMN cim_or_cpo cim_or_cpo_type;

-- Add frequency column to mine_report
ALTER TABLE mine_report ADD COLUMN frequency VARCHAR(50);

ALTER TABLE mine_report
    ADD COLUMN office_destination office_destination_type[];

-- Add foreign key constraint for permit_condition_id
ALTER TABLE mine_report
    ADD CONSTRAINT fk_mine_report_permit_condition_id
        FOREIGN KEY (permit_condition_id)
            REFERENCES permit_conditions(permit_condition_id);
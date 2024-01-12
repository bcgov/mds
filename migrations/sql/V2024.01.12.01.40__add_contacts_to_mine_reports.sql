CREATE TABLE mine_report_contact (
                          mine_report_contact_id SERIAL PRIMARY KEY,
                          name VARCHAR(255) NOT NULL,
                          email VARCHAR(255) NOT NULL,
                          mine_report_id INT REFERENCES mine_report(mine_report_id),
                          deleted_ind BOOLEAN DEFAULT FALSE
);

ALTER TABLE mine_report
    ADD COLUMN submitter_name VARCHAR(255),
    ADD COLUMN submitter_email VARCHAR(255);